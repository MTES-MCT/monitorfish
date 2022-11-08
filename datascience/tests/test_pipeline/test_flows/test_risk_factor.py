import pandas as pd

from src.db_config import create_engine
from src.pipeline.flows.risk_factor import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_risk_factor_flow(reset_test_data):

    query = """SELECT
        cfr,
        ircs,
        external_immatriculation,
        probability_risk_factor,
        detectability_risk_factor,
        risk_factor
    FROM risk_factors"""

    ############################# Reset risk_factors table ############################
    e = create_engine("monitorfish_remote")
    e.execute("DELETE FROM risk_factors;")
    assert len(read_query("monitorfish_remote", query)) == 0

    ############################## Run risk factors flow ##############################
    state = flow.run()
    assert state.is_successful()

    ######## Check that data was correctly computed and loaded to risk_factors ########
    current_segments = state.result[
        flow.get_tasks("extract_current_segments")[0]
    ].result
    control_anteriority = state.result[
        flow.get_tasks("extract_control_anteriority")[0]
    ].result
    loaded_risk_factors = read_query("monitorfish_remote", query).set_index(
        ["cfr", "ircs", "external_immatriculation"]
    )

    # Risk factors should be an outer join of vessels in current_segments and
    # control_anteriority, so if we have two vessels in current_segments, two vessels
    # in control_anteriority, one of which is in both tables, then there me be three
    # vessels in risk_factors.
    assert len(current_segments) == 2
    assert set(current_segments.cfr) == {"ABC000542519", "ABC000306959"}

    assert len(control_anteriority) == 2
    assert set(control_anteriority.ircs) == {"LLUK", "OLY7853"}

    expected_risk_factors = pd.DataFrame(
        columns=pd.Index(
            [
                "cfr",
                "ircs",
                "external_immatriculation",
                "probability_risk_factor",
                "detectability_risk_factor",
                "risk_factor",
            ]
        ),
        data=[
            ["ABC000542519", None, None, 2.0, 2.000000, 2.168944],
            ["ABC000306959", "LLUK", "RV348407", 1.0, 1.322876, 1.334146],
            [None, "OLY7853", "SB125334", 1.0, 1.322876, 1.150163],
        ],
    ).set_index(["cfr", "ircs", "external_immatriculation"])

    pd.testing.assert_frame_equal(loaded_risk_factors, expected_risk_factors)
