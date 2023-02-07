import pandas as pd
import pytest

from src.db_config import create_engine
from src.pipeline.flows.risk_factor import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def risk_factors() -> pd.DataFrame:
    return pd.DataFrame(
        columns=pd.Index(
            [
                "vessel_id",
                "cfr",
                "ircs",
                "external_immatriculation",
                "probability_risk_factor",
                "detectability_risk_factor",
                "risk_factor",
            ]
        ),
        data=[
            [1, "ABC000306959", "LLUK", "RV348407", 1.0, 1.322876, 1.334146],
            [2, "ABC000542519", None, None, 2.0, 2.000000, 2.168944],
            [3, "ABC000055481", "IL2468", "AS761555", 1.0, 1.322876, 1.150163],
            [4, "CFR_OF_LOGBK", "OLY7853", "SB125334", 1.0, 1.322876, 1.334146],
            [None, "UNKONWN_VESS", None, None, 2.0, 2.0, 1.741101],
        ],
    )


def test_risk_factor_flow(reset_test_data, risk_factors):

    query = """SELECT
        vessel_id,
        cfr,
        ircs,
        external_immatriculation,
        probability_risk_factor,
        detectability_risk_factor,
        risk_factor
    FROM risk_factors
    ORDER BY vessel_id"""

    ############################# Reset risk_factors table ############################
    e = create_engine("monitorfish_remote")
    e.execute("DELETE FROM risk_factors;")
    assert len(read_query("monitorfish_remote", query)) == 0

    ############################## Run risk factors flow ##############################
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    ######## Check that data was correctly computed and loaded to risk_factors ########
    current_segments = state.result[
        flow.get_tasks("extract_current_segments")[0]
    ].result
    control_anteriority = state.result[
        flow.get_tasks("extract_control_anteriority")[0]
    ].result
    loaded_risk_factors = read_query("monitorfish_remote", query)

    # Risk factors should be an outer join of vessels in current_segments and
    # control_anteriority, so if we have two vessels in current_segments, two vessels
    # in control_anteriority, one of which is in both tables, then there me be three
    # vessels in risk_factors.
    assert len(current_segments) == 4
    assert set(current_segments.cfr) == {
        "ABC000542519",
        "ABC000306959",
        "UNKONWN_VESS",
        "CFR_OF_LOGBK",
    }

    assert len(control_anteriority) == 3
    assert set(control_anteriority.ircs) == {"LLUK", "OLY7853", "IL2468"}

    pd.testing.assert_frame_equal(loaded_risk_factors, risk_factors)
