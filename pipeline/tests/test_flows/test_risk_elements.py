from datetime import datetime
from unittest.mock import patch

import pandas as pd
import pytest

from src.flows.risk_elements import evaluate_trips_pnos, risk_elements_flow
from src.read_query import read_query
from tests.mocks import get_utcnow_mock_factory


@pytest.fixture
def trips_subject_to_pno() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1"] * 5 + ["cfr2"] * 5,
            "trip_number": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "minimum_notification_period": [4.0] * 10,
        }
    )


@pytest.fixture
def rtps() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1"] * 4 + ["cfr2"] * 4,
            "trip_number": [1, 2, 3, 4, 7, 8, 9, 10],
            "return_datetime": [
                pd.Timestamp("2020-01-01 12:00:00"),
                pd.Timestamp("2020-01-01 12:00:00"),
                pd.Timestamp("2020-01-01 12:00:00"),
                pd.Timestamp("2020-01-01 12:00:00"),
                pd.Timestamp("2020-01-07 12:00:00"),
                pd.Timestamp("2020-01-08 12:00:00"),
                pd.Timestamp("2020-01-09 12:00:00"),
                pd.Timestamp("2020-01-10 12:00:00"),
            ],
        }
    )


@pytest.fixture
def logbook_pnos() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1"] * 4,
            "trip_number": [1, 2, 3, 5],
            "report_datetime_utc": [
                pd.Timestamp("2020-01-01 08:00:00"),
                pd.Timestamp("2020-01-01 09:30:00"),
                pd.Timestamp("2020-01-01 10:00:00"),
                pd.Timestamp("2020-01-01 08:00:00"),
            ],
            "predicted_arrival_datetime_utc": [
                pd.Timestamp("2020-01-01 12:00:00"),
                pd.Timestamp("2020-01-01 12:00:00"),
                pd.Timestamp("2020-01-01 14:00:00"),
                pd.Timestamp("2020-01-01 12:00:00"),
            ],
        }
    )


@pytest.fixture
def expected_evaluated_trips() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": [
                "cfr1",
                "cfr1",
                "cfr1",
                "cfr1",
                "cfr1",
                "cfr2",
                "cfr2",
                "cfr2",
                "cfr2",
                "cfr2",
            ],
            "trip_number": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "is_valid": [
                True,
                False,
                False,
                False,
                False,
                False,
                True,
                False,
                True,
                False,
            ],
        }
    )


@pytest.fixture
def manual_pnos() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr2"] * 4,
            "report_datetime_utc": [
                pd.Timestamp("2020-01-07 08:00:00"),
                pd.Timestamp("2020-01-08 10:00:00"),
                pd.Timestamp("2020-01-08 11:00:00"),
                pd.Timestamp("2020-01-09 08:00:00"),
            ],
            "predicted_arrival_datetime_utc": [
                pd.Timestamp("2020-01-07 12:00:00"),
                pd.Timestamp("2020-01-08 12:00:00"),
                pd.Timestamp("2020-01-08 12:00:00"),
                pd.Timestamp("2020-01-09 12:00:00"),
            ],
        }
    )


@pytest.fixture
def expected_vessels_risk_elements() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "risk_element_code": [
                "CLA_CM",
                "MOT_MR",
                "PNO_MR",
                "VMS_MR",
                "CLA_CM",
                "MOT_MR",
                "VMS_MR",
                "CLA_CM",
                "VMS_MR",
                "MOT_MR",
            ],
            "cfr": [
                "ABC000306959",
                "ABC000306959",
                "ABC000306959",
                "ABC000306959",
                "CFR000888888",
                "CFR000888888",
                "CFR000888888",
                "SOME_VESSEL",
                "SOME_VESSEL",
                "XXX123456789",
            ],
            "metrics": [
                {"occurrences": 0},
                {
                    "total_trips": 2,
                    "compliant_trips": 2,
                    "share_of_non_compliant_trips": 0.0,
                },
                {
                    "total_trips": 4,
                    "compliant_trips": 2,
                    "share_of_non_compliant_trips": 0.5,
                },
                {"occurrences": 1},
                {"occurrences": 0},
                {
                    "total_trips": 2,
                    "compliant_trips": 0,
                    "share_of_non_compliant_trips": 1.0,
                },
                {"occurrences": 0},
                {"occurrences": 1},
                {"occurrences": 0},
                {
                    "total_trips": 1,
                    "compliant_trips": 0,
                    "share_of_non_compliant_trips": 1.0,
                },
            ],
            "risk_level": [1, 1, 4, 2, 1, 4, 1, 2, 1, 4],
        }
    )


def test_evaluate_trips_pnos(
    trips_subject_to_pno, rtps, logbook_pnos, manual_pnos, expected_evaluated_trips
):
    evaluated_trips = evaluate_trips_pnos(
        trips_subject_to_pno, rtps, manual_pnos, logbook_pnos
    )

    pd.testing.assert_frame_equal(evaluated_trips, expected_evaluated_trips)


@patch(
    "src.flows.risk_elements.get_utcnow", get_utcnow_mock_factory(datetime(2010, 1, 1))
)
def test_risk_elements_flow(
    reset_test_data,
    add_catches,
    add_pnos,
    add_rtps,
    add_pno_type_rules_unnested,
    add_landings,
    add_vms,
    expected_vessels_risk_elements,
):
    vessels_risk_elements_query = (
        "SELECT * FROM vessels_risk_elements ORDER BY cfr, risk_element_code;"
    )

    initial_vessels_risk_elements = read_query(
        vessels_risk_elements_query, db="monitorfish_remote"
    )

    state = risk_elements_flow(return_state=True)
    assert state.is_completed()

    final_vessels_risk_elements = read_query(
        vessels_risk_elements_query, db="monitorfish_remote"
    )
    assert len(initial_vessels_risk_elements) == 0
    pd.testing.assert_frame_equal(
        final_vessels_risk_elements, expected_vessels_risk_elements
    )

    # Re-running the flow should yield the same result
    state = risk_elements_flow(return_state=True)
    assert state.is_completed()

    final_vessels_risk_elements = read_query(
        vessels_risk_elements_query, db="monitorfish_remote"
    )
    pd.testing.assert_frame_equal(
        final_vessels_risk_elements, expected_vessels_risk_elements
    )
