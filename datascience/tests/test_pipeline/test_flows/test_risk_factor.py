import pandas as pd
import pytest
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.flows.risk_factor import flow
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def risk_factors() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "vessel_id": [1.0, 2.0, 3.0, 4.0, 5.0, None],
            "cfr": [
                "ABC000306959",
                "ABC000542519",
                "ABC000055481",
                "CFR_OF_LOGBK",
                "OLD_VESSEL_1",
                "UNKONWN_VESS",
            ],
            "ircs": ["LLUK", None, "IL2468", "OLY7853", "SOMEID", None],
            "external_immatriculation": [
                "RV348407",
                None,
                "AS761555",
                "SB125334",
                "HG987654",
                None,
            ],
            "probability_risk_factor": [1.0, 2.0, 1.0, 1.0, 1.0, 2.0],
            "detectability_risk_factor": [
                1.3228756555323,
                2.0,
                1.3228756555323,
                1.3228756555323,
                1.3228756555323,
                2.0,
            ],
            "risk_factor": [
                1.3341460388872,
                2.1689435423954,
                1.1501633168956,
                1.3341460388872,
                1.1501633168956,
                1.74110112659225,
            ],
            "last_control_logbook_infractions": [[], [], [], [], [], []],
            "last_control_gear_infractions": [
                [],
                [],
                [],
                [
                    {
                        "natinf": 27724,
                        "comments": "Infraction engin",
                        "infractionType": "WITHOUT_RECORD",
                    }
                ],
                [],
                [],
            ],
            "last_control_species_infractions": [
                [],
                [],
                [],
                [
                    {
                        "natinf": 1030,
                        "comments": "Infraction espèces 2",
                        "infractionType": "WITH_RECORD",
                    }
                ],
                [],
                [],
            ],
            "last_control_other_infractions": [
                [],
                [],
                [
                    {
                        "natinf": 20233,
                        "comments": "Infraction 3",
                        "infractionType": "WITH_RECORD",
                    }
                ],
                [],
                [{"natinf": 2606}, {"natinf": 4761}, {"natinf": 22206}],
                [],
            ],
        }
    )


def test_risk_factor_flow(reset_test_data, risk_factors):
    query = """SELECT
        vessel_id,
        cfr,
        ircs,
        external_immatriculation,
        probability_risk_factor,
        detectability_risk_factor,
        risk_factor,
        last_control_logbook_infractions,
        last_control_gear_infractions,
        last_control_species_infractions,
        last_control_other_infractions
    FROM risk_factors
    ORDER BY vessel_id"""

    ############################# Reset risk_factors table ############################
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(text("DELETE FROM risk_factors;"))
    assert len(read_query(query, db="monitorfish_remote")) == 0

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
    loaded_risk_factors = read_query(query, db="monitorfish_remote")

    # Risk factors should be an outer join of vessels in current_segments and
    # control_anteriority, so if we have two vessels in current_segments, two vessels
    # in control_anteriority, one of which is in both tables, then there me be three
    # vessels in risk_factors.
    assert len(current_segments) == 5
    assert set(current_segments.cfr) == {
        "ABC000542519",
        "ABC000306959",
        "UNKONWN_VESS",
        "CFR_OF_LOGBK",
        "OLD_VESSEL_1",
    }

    assert len(control_anteriority) == 4
    assert set(control_anteriority.ircs) == {"LLUK", "OLY7853", "IL2468", "SOMEID"}

    pd.testing.assert_frame_equal(loaded_risk_factors, risk_factors)
