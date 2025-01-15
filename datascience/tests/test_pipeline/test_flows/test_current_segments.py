import datetime
from ast import literal_eval

import pandas as pd
import pytest
from dateutil import relativedelta

from config import TEST_DATA_LOCATION
from src.pipeline.flows.current_segments import (
    compute_current_segments,
    extract_control_priorities,
    extract_current_catches,
    extract_last_positions,
    flow,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def expected_last_positions() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["ABC000055481", "ABC000542519"],
            "facade": [None, "NAMO"],
        }
    )


@pytest.fixture
def current_catches() -> pd.DataFrame:
    df = pd.read_csv(
        TEST_DATA_LOCATION / "csv/current_catches.csv",
        converters={"gear_onboard": literal_eval},
        parse_dates=[
            "last_logbook_message_datetime_utc",
            "departure_datetime_utc",
        ],
    )
    return df


@pytest.fixture
def control_priorities() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "facade": ["Facade 1", "Facade 1", "Facade 2", "Facade 2"],
            "segment": ["T8-9", "L", "T8-9", "L"],
            "control_priority_level": [2.5, 2.8, 2.9, 2.4],
        }
    )


@pytest.fixture
def last_positions() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": [
                "vessel1_L_T8-9",
                "noVesselId_T8-PEL_T8-9",
                "vessel3_T8-9",
                "vessel4_L-HKE",
                "vessel5_nocatch",
            ],
            "facade": [
                "Facade 1",
                "Facade 2",
                "Facade 2",
                "Facade 1",
                "Facade 1",
            ],
        }
    )


@pytest.fixture
def expected_current_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": [
                "vessel1_L_T8-9",
                "noVesselId_T8-PEL_T8-9",
                "vessel2_FT",
                "vessel3_T8-9",
                "vessel4_L-HKE",
                "vessel5_nocatch",
            ],
            "ircs": ["IRCS1", "IRCS_", None, "IRCS3", "IRCS4", "IRCS5"],
            "external_immatriculation": [None, "EXT_", None, "EXT3", None, None],
            "vessel_id": [1, None, 2, 3, 4, 5],
            "last_logbook_message_datetime_utc": [
                pd.Timestamp("2020-12-05 12:58:00"),
                pd.Timestamp("2021-11-05 10:41:30"),
                pd.Timestamp("2026-05-05 10:41:30"),
                pd.Timestamp("2020-02-01 08:21:20"),
                pd.Timestamp("2020-03-01 08:21:20"),
                pd.Timestamp("2020-03-01 08:21:20"),
            ],
            "departure_datetime_utc": [
                pd.Timestamp("2020-12-05 12:58:00"),
                pd.NaT,
                pd.Timestamp("2026-05-05 10:41:30"),
                pd.Timestamp("2020-02-01 08:21:20"),
                pd.Timestamp("2020-03-01 08:21:20"),
                pd.Timestamp("2020-03-01 08:21:20"),
            ],
            "trip_number": ["TRIP_ABC", None, "TRIP_DEF", None, "TRIP_GHI", "TRIP_JKL"],
            "gear_onboard": [
                [
                    {"gear": "OTB", "mesh": 80, "dimensions": "20;2"},
                    {"gear": "LLS", "mesh": None, "dimensions": "7.0;8.0"},
                ],
                None,
                None,
                None,
                None,
                None,
            ],
            "species_onboard": [
                [
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.a",
                        "species": "BSS",
                        "mesh": 80.0,
                        "weight": 200.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.a",
                        "species": "BSS",
                        "mesh": 80.0,
                        "weight": 200.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.7.a",
                        "species": "BSS",
                        "mesh": None,
                        "weight": 200.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.8.a",
                        "species": "BSS",
                        "mesh": None,
                        "weight": 200.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.a",
                        "species": "HKE",
                        "mesh": 80.0,
                        "weight": 100.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.a",
                        "species": "HKE",
                        "mesh": 80.0,
                        "weight": 100.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.7.a",
                        "species": "HKE",
                        "mesh": None,
                        "weight": 100.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.8.a",
                        "species": "HKE",
                        "mesh": None,
                        "weight": 100.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.a",
                        "species": "NEP",
                        "mesh": 80.0,
                        "weight": 250.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.a",
                        "species": "NEP",
                        "mesh": 80.0,
                        "weight": 250.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.7.a",
                        "species": "NEP",
                        "mesh": None,
                        "weight": 250.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.8.a",
                        "species": "NEP",
                        "mesh": None,
                        "weight": 250.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.a",
                        "species": "SOL",
                        "mesh": 80.0,
                        "weight": 100.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.a",
                        "species": "SOL",
                        "mesh": 80.0,
                        "weight": 100.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.7.a",
                        "species": "SOL",
                        "mesh": None,
                        "weight": 100.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.8.a",
                        "species": "SOL",
                        "mesh": None,
                        "weight": 100.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.a",
                        "species": "SWO",
                        "mesh": 80.0,
                        "weight": 80.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.a",
                        "species": "SWO",
                        "mesh": 80.0,
                        "weight": 80.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.7.a",
                        "species": "SWO",
                        "mesh": None,
                        "weight": 80.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.8.a",
                        "species": "SWO",
                        "mesh": None,
                        "weight": 80.0,
                    },
                ],
                [
                    {
                        "gear": "OTM",
                        "faoZone": "27.8",
                        "species": "PIL",
                        "mesh": 80.0,
                        "weight": 5000.0,
                    },
                    {
                        "gear": "OTM",
                        "faoZone": "27.9",
                        "species": "PIL",
                        "mesh": 80.0,
                        "weight": 5000.0,
                    },
                ],
                [
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.d",
                        "species": "ABC",
                        "mesh": 90.0,
                        "weight": 200000.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.e",
                        "species": "DEF",
                        "mesh": 90.0,
                        "weight": 22000.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "28.8.a",
                        "species": "GHI",
                        "mesh": 90.0,
                        "weight": 15000.0,
                    },
                ],
                [
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.d",
                        "species": "ABC",
                        "mesh": 90.0,
                        "weight": 200000.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.7.e",
                        "species": "DEF",
                        "mesh": 90.0,
                        "weight": 22000.0,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.a",
                        "species": "GHI",
                        "mesh": 90.0,
                        "weight": 15000.0,
                    },
                ],
                [
                    {
                        "gear": "LLS",
                        "faoZone": "27.8.a",
                        "species": "HKE",
                        "mesh": None,
                        "weight": 120.0,
                    },
                    {
                        "gear": "LLS",
                        "faoZone": "27.8.a",
                        "species": "COD",
                        "mesh": None,
                        "weight": 50.0,
                    },
                ],
                None,
            ],
            "segments": [["T8-9", "L"], ["T8-PEL"], ["FT"], ["T8-9"], ["L HKE"], None],
            "total_weight_onboard": [2920.0, 10000.0, 237000.0, 237000.0, 170.0, 0.0],
            "segment_highest_impact": ["T8-9", "T8-PEL", "FT", "T8-9", "L HKE", None],
            "impact_risk_factor": [2.2, 2.3, 3.3, 2.2, 2.2, 1.0],
            "segment_highest_priority": ["L", None, None, "T8-9", None, None],
            "control_priority_level": [2.8, 1.0, 1.0, 2.9, 1.0, 1.0],
        }
    )


@pytest.fixture
def current_segments() -> pd.DataFrame:
    now = datetime.datetime.utcnow()
    return pd.DataFrame(
        {
            "cfr": [
                "ABC000000000",
                "ABC000306959",
                "ABC000542519",
                "INVA_PNO_VES",
                "___TARGET___",
            ],
            "last_logbook_message_datetime_utc": [
                now - relativedelta.relativedelta(months=1, minutes=27),
                now - datetime.timedelta(days=1, hours=6),
                now - datetime.timedelta(weeks=1, days=3),
                now - relativedelta.relativedelta(months=1, minutes=14),
                now - relativedelta.relativedelta(months=1, minutes=34),
            ],
            "departure_datetime_utc": [
                pd.NaT,
                now - datetime.timedelta(days=2),
                now - datetime.timedelta(weeks=1, days=5),
                pd.NaT,
                pd.NaT,
            ],
            "trip_number": [None, "20210001", "20210002", None, None],
            "gear_onboard": [
                None,
                [{"gear": "OTM", "mesh": 80, "dimensions": None}],
                [{"gear": "OTB", "mesh": 80, "dimensions": None}],
                None,
                None,
            ],
            "species_onboard": [
                None,
                [
                    {
                        "gear": "OTM",
                        "mesh": 80.0,
                        "weight": 713.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                    }
                ],
                [
                    {
                        "gear": "OTB",
                        "mesh": 80.0,
                        "weight": 2426.0,
                        "faoZone": "27.8.c",
                        "species": "HKE",
                    },
                    {
                        "gear": "OTB",
                        "mesh": 80.0,
                        "weight": 157.0,
                        "faoZone": "27.8.c",
                        "species": "SOL",
                    },
                ],
                None,
                None,
            ],
            "segments": [[], [], ["SWW01/02/03"], [], []],
            "total_weight_onboard": [0.0, 713.0, 2583.0, 0.0, 0.0],
            "probable_segments": [None, None, None, None, None],
            "impact_risk_factor": [1.0, 1.0, 3.0, 1.0, 1.0],
            "control_priority_level": [1.0, 1.0, 1.0, 1.0, 1.0],
            "segment_highest_impact": [None, None, "SWW01/02/03", None, None],
            "segment_highest_priority": [None, None, None, None, None],
            "vessel_id": [None, 1.0, 2.0, None, 7.0],
            "external_immatriculation": [None, "RV348407", "RO237719", None, None],
            "ircs": [None, "LLUK", "FQ7058", None, None],
        }
    )


def test_extract_current_catches(reset_test_data, current_catches):
    catches = extract_current_catches.run(number_of_days=90)
    assert len(catches) == 6
    assert set(catches.cfr) == {
        "ABC000542519",
        "ABC000306959",
        "ABC000000000",
        "___TARGET___",
        "INVA_PNO_VES",
    }
    assert set(catches.ircs) == {"LLUK", "FQ7058", None}
    assert set(catches.loc[catches.cfr == "ABC000542519", "trip_number"]) == {
        "20210002"
    }
    assert catches.loc[
        (catches.cfr == "ABC000542519") & (catches.species == "HKE"), "weight"
    ].to_list() == [2426.0]
    assert list(catches) == list(
        current_catches.drop(columns=["segment", "impact_risk_factor"])
    )


def test_extract_control_priorities(reset_test_data):
    control_priorities = extract_control_priorities.run()
    expected_control_priorities = pd.DataFrame(
        columns=["facade", "segment", "control_priority_level"],
        data=[["SA", "SWW01/02/03", 1.0], ["SA", "SWW04", 3.0]],
    )
    pd.testing.assert_frame_equal(control_priorities, expected_control_priorities)


def test_extract_last_positions(reset_test_data, expected_last_positions):
    last_positions = extract_last_positions.run()
    pd.testing.assert_frame_equal(last_positions, expected_last_positions)


def test_compute_current_segments(
    current_catches,
    segments_of_year,
    last_positions,
    control_priorities,
    expected_current_segments,
):
    res = compute_current_segments.run(
        current_catches, segments_of_year, last_positions, control_priorities
    )
    pd.testing.assert_frame_equal(res, expected_current_segments)


def test_current_segments_flow(reset_test_data, current_segments):
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    computed_current_segments = read_query(
        "SELECT * FROM current_segments ORDER BY cfr", db="monitorfish_remote"
    )
    datetime_columns = [
        "last_logbook_message_datetime_utc",
        "departure_datetime_utc",
    ]
    pd.testing.assert_frame_equal(
        current_segments.drop(columns=datetime_columns),
        computed_current_segments.drop(columns=datetime_columns),
    )

    assert (
        (
            (
                current_segments[datetime_columns]
                - computed_current_segments[datetime_columns]
            )
            .abs()
            .fillna(datetime.timedelta(seconds=0))
            < datetime.timedelta(seconds=10)
        )
        .all()
        .all()
    )
