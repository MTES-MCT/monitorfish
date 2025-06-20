import pandas as pd
import pytest
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.entities.vessel_profiles import VesselProfileType
from src.pipeline.flows.risk_factor import (
    compute_profile_segments_impact_and_priority,
    extract_recent_segments,
    flow,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def risk_factors() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": [
                "ABC000055481",
                "ABC000145907",
                "ABC000306959",
                "ABC000542519",
                "CFR_OF_LOGBK",
                "DEF000115851",
                "DEF000155891",
                "OLD_VESSEL_1",
                "UNKONWN_VESS",
            ],
            "ircs": [
                "IL2468",
                None,
                "LLUK",
                "FQ7058",
                "OLY7853",
                None,
                None,
                "SOMEID",
                None,
            ],
            "external_immatriculation": [
                "AS761555",
                None,
                "RV348407",
                "RO237719",
                "SB125334",
                None,
                None,
                "HG987654",
                None,
            ],
            "last_logbook_message_datetime_utc": [
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2022-04-06 03:13:10"),
                pd.Timestamp("2022-03-28 09:13:10"),
                pd.Timestamp("2022-02-06 03:13:10"),
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2020-02-01 05:59:06"),
                pd.Timestamp("2022-03-20 01:18:19"),
            ],
            "departure_datetime_utc": [
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2018-02-27 01:05:00"),
                pd.Timestamp("2022-03-26 09:13:10"),
                pd.Timestamp("2018-02-01 01:05:00"),
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2020-02-01 01:05:00"),
                pd.Timestamp("2022-03-18 05:23:10"),
            ],
            "trip_number": [
                None,
                None,
                "20210001",
                "20210002",
                "20220004",
                None,
                None,
                "20200006",
                "20220027",
            ],
            "gear_onboard": [
                None,
                None,
                [{"gear": "OTM", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "OTM", "mesh": 80.0}],
                None,
                None,
                [{"gear": "PTB", "mesh": 65.0}],
                [{"gear": "OTM", "mesh": 100.0}],
            ],
            "species_onboard": [
                None,
                None,
                [
                    {
                        "gear": "OTM",
                        "weight": 713.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                    }
                ],
                [
                    {
                        "gear": "OTB",
                        "weight": 157.0,
                        "faoZone": "27.8.c",
                        "species": "SOL",
                    },
                    {
                        "gear": "OTB",
                        "weight": 2426.0,
                        "faoZone": "27.8.c",
                        "species": "HKE",
                    },
                ],
                [
                    {
                        "gear": "OTM",
                        "weight": 713.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                    }
                ],
                None,
                None,
                [
                    {
                        "gear": "PTB",
                        "weight": 213.0,
                        "faoZone": "27.7.a",
                        "species": "ANE",
                    }
                ],
                [
                    {
                        "gear": "OTM",
                        "weight": 57.0,
                        "faoZone": "37.12.c",
                        "species": "MYS",
                    }
                ],
            ],
            "segments": [[], [], ["SWW04"], ["SWW01/02/03"], ["SWW04"], [], [], [], []],
            "total_weight_onboard": [
                None,
                None,
                713.0,
                2583.0,
                713.0,
                None,
                None,
                213.0,
                57.0,
            ],
            "last_control_datetime_utc": [
                pd.Timestamp("2018-01-08 08:57:45"),
                pd.NaT,
                pd.Timestamp("2020-06-08 19:21:40"),
                pd.NaT,
                pd.Timestamp("2017-01-08 08:57:45"),
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2018-01-01 07:57:45"),
                pd.NaT,
            ],
            "last_control_infraction": [
                False,
                None,
                True,
                None,
                True,
                None,
                None,
                False,
                None,
            ],
            "post_control_comments": [
                "RAS",
                None,
                "OTB 70MM DÉCLARÉ - signaux pyrotechniques périmés",
                None,
                "CA PECHE OU BIEN?",
                None,
                None,
                "RAS",
                None,
            ],
            "impact_risk_factor": [1.0, 1.0, 2.1, 3.0, 2.1, 1.0, 1.0, 1.0, 1.0],
            "probability_risk_factor": [1.0, 2.0, 1.0, 2.0, 1.0, 2.0, 2.0, 1.0, 2.0],
            "detectability_risk_factor": [
                1.3228756555323,
                2.0,
                1.3228756555323,
                2.0,
                1.3228756555323,
                2.0,
                2.0,
                1.3228756555323,
                2.0,
            ],
            "risk_factor": [
                1.1501633168956,
                1.74110112659225,
                1.3341460388872,
                2.1689435423954,
                1.3341460388872,
                1.74110112659225,
                1.74110112659225,
                1.1501633168956,
                1.74110112659225,
            ],
            "control_priority_level": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
            "control_rate_risk_factor": [
                1.75,
                4.0,
                1.75,
                4.0,
                1.75,
                4.0,
                4.0,
                1.75,
                4.0,
            ],
            "infraction_rate_risk_factor": [
                1.0,
                2.0,
                1.0,
                2.0,
                1.0,
                2.0,
                2.0,
                1.0,
                2.0,
            ],
            "infraction_score": [-5.5, None, -4.5, None, -5.5, None, None, -5.5, None],
            "number_controls_last_3_years": [11, 0, 5, 0, 11, 0, 0, 11, 0],
            "number_controls_last_5_years": [11, 0, 6, 0, 11, 0, 0, 11, 0],
            "number_infractions_last_5_years": [1, 0, 6, 0, 1, 0, 0, 1, 0],
            "number_recent_controls": [1, 0, 2, 0, 1, 0, 0, 1, 0],
            "segment_highest_impact": [
                None,
                None,
                "SWW04",
                "SWW01/02/03",
                "SWW04",
                None,
                None,
                None,
                None,
            ],
            "segment_highest_priority": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "vessel_id": [3.0, None, 1.0, 2.0, 4.0, None, None, 5.0, None],
            "number_gear_seizures_last_5_years": [1, 0, 1, 0, 2, 0, 0, 1, 0],
            "number_species_seizures_last_5_years": [3, 0, 1, 0, 0, 0, 0, 3, 0],
            "number_vessel_seizures_last_5_years": [0, 0, 1, 0, 0, 0, 0, 0, 0],
            "last_control_logbook_infractions": [[], [], [], [], [], [], [], [], []],
            "last_control_gear_infractions": [
                [],
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
                [],
                [],
            ],
            "last_control_species_infractions": [
                [],
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
                [],
                [],
            ],
            "last_control_other_infractions": [
                [
                    {
                        "natinf": 20233,
                        "comments": "Infraction 3",
                        "infractionType": "WITH_RECORD",
                    }
                ],
                [],
                [],
                [],
                [],
                [],
                [],
                [{"natinf": 2606}, {"natinf": 4761}, {"natinf": 22206}],
                [],
            ],
            "recent_gear_onboard": [
                None,
                [{"gear": "PS1", "mesh": 80.0}],
                None,
                [{"gear": "OTB", "mesh": 80.0}],
                None,
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "FPO", "mesh": 80.0}, {"gear": "GTR", "mesh": 80.0}],
                None,
                None,
            ],
            "recent_segments": [
                [],
                ["SWW04"],
                [],
                ["SWW04"],
                [],
                ["SWW04"],
                ["SWW01/02/03"],
                [],
                [],
            ],
            "recent_segments_impact_risk_factor": [
                1.0,
                2.1,
                1.0,
                2.1,
                1.0,
                2.1,
                3.0,
                1.0,
                1.0,
            ],
            "recent_segments_detectability_risk_factor": [
                1.3228756555323,
                2.0,
                1.3228756555323,
                2.0,
                1.3228756555323,
                2.0,
                2.0,
                1.3228756555323,
                2.0,
            ],
            "recent_segments_risk_factor": [
                1.1501633168956,
                2.01961159534697,
                1.1501633168956,
                2.01961159534697,
                1.1501633168956,
                2.01961159534697,
                2.1689435423954,
                1.1501633168956,
                1.74110112659225,
            ],
            "recent_segments_control_priority_level": [
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
            ],
            "recent_segment_highest_impact": [
                None,
                "SWW04",
                None,
                "SWW04",
                None,
                "SWW04",
                "SWW01/02/03",
                None,
                None,
            ],
            "recent_segment_highest_priority": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "usual_gear_onboard": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "usual_segments": [[], [], [], [], [], [], [], [], []],
            "usual_segments_impact_risk_factor": [
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
            ],
            "usual_segments_detectability_risk_factor": [
                1.3228756555323,
                2.0,
                1.3228756555323,
                2.0,
                1.3228756555323,
                2.0,
                2.0,
                1.3228756555323,
                2.0,
            ],
            "usual_segments_risk_factor": [
                1.1501633168956,
                1.74110112659225,
                1.1501633168956,
                1.74110112659225,
                1.1501633168956,
                1.74110112659225,
                1.74110112659225,
                1.1501633168956,
                1.74110112659225,
            ],
            "usual_segments_control_priority_level": [
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
                1.0,
            ],
            "usual_segment_highest_impact": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
            "usual_segment_highest_priority": [
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
                None,
            ],
        }
    )


@pytest.fixture
def expected_recent_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "vessel_id": [None, 2.0, None, None],
            "cfr": ["ABC000145907", "ABC000542519", "DEF000115851", "DEF000155891"],
            "ircs": [None, "FQ7058", None, None],
            "external_immatriculation": [None, "RO237719", None, None],
            "gear_onboard": [
                [{"gear": "PS1", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "FPO", "mesh": 80.0}, {"gear": "GTR", "mesh": 80.0}],
            ],
            "segments": [
                {"SWW04": 1.0},
                {"SWW04": 1.0},
                {"SWW04": 1.0},
                {"SWW01/02/03": 1.0},
            ],
            "facade": ["Hors façade", "NAMO", "NAMO", "NAMO"],
        }
    )


@pytest.fixture
def recent_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "vessel_id": [None, 2.0, None, None, None],
            "cfr": [
                "ABC000145907",
                "ABC000542519",
                "DEF000115851",
                "DEF000155891",
                "GHI123456789",
            ],
            "ircs": [None, "FQ7058", None, None, None],
            "external_immatriculation": [None, "RO237719", None, None, None],
            "gear_onboard": [
                [{"gear": "PS1", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "FPO", "mesh": 80.0}, {"gear": "GTR", "mesh": 80.0}],
                [{"gear": "OTM", "mesh": 100.0}],
            ],
            "segments": [
                {"T8-9": 1.0},
                {"L": 1.0},
                {"T8-9": 1.0},
                {"L": 0.4, "T8-9": 0.4, "SEGMENT_WITHOUT_IMPACT": 0.1},
                {"SEGMENT_WITHOUT_IMPACT": 1.0},
            ],
            "facade": ["Facade 2", "Facade 1", "Hors facade", "Facade 1", "Facade 3"],
        }
    )


@pytest.fixture
def computed_recent_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": [
                "ABC000145907",
                "ABC000542519",
                "DEF000115851",
                "DEF000155891",
                "GHI123456789",
            ],
            "vessel_id": [None, 2.0, None, None, None],
            "ircs": [None, "FQ7058", None, None, None],
            "external_immatriculation": [None, "RO237719", None, None, None],
            "recent_gear_onboard": [
                [{"gear": "PS1", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
                [{"gear": "FPO", "mesh": 80.0}, {"gear": "GTR", "mesh": 80.0}],
                [{"gear": "OTM", "mesh": 100.0}],
            ],
            "recent_segments": [
                ["T8-9"],
                ["L"],
                ["T8-9"],
                ["L", "T8-9", "SEGMENT_WITHOUT_IMPACT"],
                ["SEGMENT_WITHOUT_IMPACT"],
            ],
            "recent_segment_highest_impact": ["T8-9", "L", "T8-9", "T8-9", None],
            "recent_segments_impact_risk_factor": [2.2, 1.9, 2.2, 2.2, None],
            "recent_segment_highest_priority": ["T8-9", "L", None, "L", None],
            "recent_segments_control_priority_level": [2.9, 2.8, None, 2.8, None],
        }
    )


def test_extract_recent_segments(reset_test_data, expected_recent_segments):
    res = extract_recent_segments.run()
    pd.testing.assert_frame_equal(
        res.sort_values("cfr").reset_index(drop=True), expected_recent_segments
    )


def test_compute_profile_segments_impact_and_priority(
    recent_segments, segments_of_year, control_priorities, computed_recent_segments
):
    res = compute_profile_segments_impact_and_priority.run(
        recent_segments, segments_of_year, control_priorities, VesselProfileType.RECENT
    )
    pd.testing.assert_frame_equal(res, computed_recent_segments)


def test_risk_factor_flow(reset_test_data, risk_factors):
    query = """SELECT *
    FROM risk_factors
    ORDER BY cfr"""

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

    pd.testing.assert_frame_equal(
        loaded_risk_factors.drop(columns=["id"]), risk_factors
    )
