from datetime import datetime
from unittest.mock import patch

import pandas as pd
import pytest

from src.entities.risk_elements import RiskElement
from src.flows.risk_elements import (
    compute_occurrences_vessels_risk_elements,
    compute_vessels_risk_elements,
    evaluate_trips_margin_of_tolerance,
    evaluate_trips_pnos,
    risk_elements_flow,
)
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
            "is_compliant": [
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
                {"occurrences": 0, "reportingIds": []},
                {
                    "totalTrips": 2,
                    "compliantTrips": 2,
                    "shareOfNonCompliantTrips": 0.0,
                    "nonCompliantTrips": [],
                },
                {
                    "totalTrips": 4,
                    "compliantTrips": 2,
                    "shareOfNonCompliantTrips": 0.5,
                    "nonCompliantTrips": [
                        {
                            "tripNumber": "Trip_6",
                            "startDateTimeUtc": "2050-04-12T10:56:00Z",
                            "endDateTimeUtc": "2050-04-12T10:56:00Z",
                        },
                        {
                            "tripNumber": "8",
                            "startDateTimeUtc": None,
                            "endDateTimeUtc": None,
                        },
                    ],
                },
                {"occurrences": 1, "beaconMalfunctionIds": [5]},
                {"occurrences": 0, "reportingIds": []},
                {
                    "totalTrips": 2,
                    "compliantTrips": 0,
                    "shareOfNonCompliantTrips": 1.0,
                    "nonCompliantTrips": [
                        {
                            "tripNumber": "nok_trip",
                            "startDateTimeUtc": "2050-04-12T10:56:00Z",
                            "endDateTimeUtc": "2050-04-12T10:56:00Z",
                        },
                        {
                            "tripNumber": "3",
                            "startDateTimeUtc": "2050-04-12T10:56:00Z",
                            "endDateTimeUtc": "2050-04-12T10:56:00Z",
                        },
                    ],
                },
                {"occurrences": 0, "beaconMalfunctionIds": []},
                {"occurrences": 1, "reportingIds": [57]},
                {"occurrences": 0, "beaconMalfunctionIds": []},
                {
                    "totalTrips": 1,
                    "compliantTrips": 0,
                    "shareOfNonCompliantTrips": 1.0,
                    "nonCompliantTrips": [
                        {
                            "tripNumber": "XXX_00",
                            "startDateTimeUtc": "2050-04-12T10:56:00Z",
                            "endDateTimeUtc": "2050-04-12T10:56:00Z",
                        },
                    ],
                },
            ],
            "risk_level": [1, 1, 4, 2, 1, 4, 1, 2, 1, 4],
        }
    )


@pytest.fixture
def trips() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1"] * 4 + ["cfr2"] * 2 + ["cfr3"],
            "trip_number": ["1", "2", "3", "4", "5", "6", "7"],
            "start_datetime_utc": [
                pd.Timestamp("2020-01-01 06:00:00"),
                pd.Timestamp("2020-01-10 06:00:00"),
                pd.Timestamp("2020-01-03 06:00:00"),
                pd.Timestamp("2020-01-05 06:00:00"),
                pd.Timestamp("2020-01-01 06:00:00"),
                pd.Timestamp("2020-01-02 06:00:00"),
                pd.Timestamp("2020-01-01 06:00:00"),
            ],
            "end_datetime_utc": [
                pd.Timestamp("2020-01-02 18:00:00"),
                pd.Timestamp("2020-01-12 18:30:00"),
                pd.Timestamp("2020-01-04 18:00:00"),
                pd.Timestamp("2020-01-07 18:00:00"),
                pd.Timestamp("2020-01-01 18:00:00"),
                pd.Timestamp("2020-01-02 18:00:00"),
                pd.Timestamp("2020-01-01 18:00:00"),
            ],
        }
    )


@pytest.fixture
def mot_mr_compliant_trips() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1", "cfr2", "cfr2", "cfr_compliant_trip_only"],
            "trip_number": ["1", "5", "6", "8"],
        }
    )


@pytest.fixture
def expected_mot_mr_evaluated_trips() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1"] * 4 + ["cfr2"] * 2 + ["cfr3"],
            "trip_number": ["1", "2", "3", "4", "5", "6", "7"],
            "is_compliant": [True, False, False, False, True, True, False],
        }
    )


@pytest.fixture
def evaluated_trips() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1"] * 4 + ["cfr2"] * 2 + ["cfr3", "cfr_trip_not_in_trips"],
            "trip_number": ["1", "2", "3", "4", "5", "6", "7", "9"],
            "is_compliant": [True, False, False, False, True, True, False, False],
        }
    )


@pytest.fixture
def expected_computed_vessels_risk_elements() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "risk_element_code": ["MOT_MR", "MOT_MR", "MOT_MR", "MOT_MR"],
            "cfr": ["cfr1", "cfr2", "cfr3", "cfr_trip_not_in_trips"],
            "metrics": [
                {
                    "totalTrips": 4,
                    "compliantTrips": 1,
                    "shareOfNonCompliantTrips": 0.75,
                    "nonCompliantTrips": [
                        {
                            "tripNumber": "2",
                            "startDateTimeUtc": "2020-01-10T06:00:00Z",
                            "endDateTimeUtc": "2020-01-12T18:30:00Z",
                        },
                        {
                            "tripNumber": "4",
                            "startDateTimeUtc": "2020-01-05T06:00:00Z",
                            "endDateTimeUtc": "2020-01-07T18:00:00Z",
                        },
                        {
                            "tripNumber": "3",
                            "startDateTimeUtc": "2020-01-03T06:00:00Z",
                            "endDateTimeUtc": "2020-01-04T18:00:00Z",
                        },
                    ],
                },
                {
                    "totalTrips": 2,
                    "compliantTrips": 2,
                    "shareOfNonCompliantTrips": 0.0,
                    "nonCompliantTrips": [],
                },
                {
                    "totalTrips": 1,
                    "compliantTrips": 0,
                    "shareOfNonCompliantTrips": 1.0,
                    "nonCompliantTrips": [
                        {
                            "tripNumber": "7",
                            "startDateTimeUtc": "2020-01-01T06:00:00Z",
                            "endDateTimeUtc": "2020-01-01T18:00:00Z",
                        },
                    ],
                },
                {
                    "totalTrips": 1,
                    "compliantTrips": 0,
                    "shareOfNonCompliantTrips": 1.0,
                    "nonCompliantTrips": [
                        {
                            "tripNumber": "9",
                            "startDateTimeUtc": None,
                            "endDateTimeUtc": None,
                        },
                    ],
                },
            ],
            "risk_level": [4, 1, 4, 4],
        }
    )


@pytest.fixture
def vessels() -> pd.DataFrame:
    return pd.DataFrame({"cfr": ["cfr1", "cfr2", "cfr3"]})


@pytest.fixture
def occurrences() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "cfr": ["cfr1", "cfr3", "cfr_not_in_vessels"],
            "occurrences": [2, 1, 1],
            "reporting_ids": [[12, 4], [7], [8]],
        }
    )


@pytest.fixture
def expected_computed_occurrences_vessels_risk_elements() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "risk_element_code": ["CLA_CM", "CLA_CM", "CLA_CM"],
            "cfr": ["cfr1", "cfr2", "cfr3"],
            "metrics": [
                {"occurrences": 2, "reportingIds": [12, 4]},
                {"occurrences": 0, "reportingIds": []},
                {"occurrences": 1, "reportingIds": [7]},
            ],
            "risk_level": [3, 1, 2],
        }
    )


def test_evaluate_trips_pnos(
    trips_subject_to_pno, rtps, logbook_pnos, manual_pnos, expected_evaluated_trips
):
    evaluated_trips = evaluate_trips_pnos(
        trips_subject_to_pno, rtps, manual_pnos, logbook_pnos
    )

    pd.testing.assert_frame_equal(evaluated_trips, expected_evaluated_trips)


def test_evaluate_trips_margin_of_tolerance(
    trips, mot_mr_compliant_trips, expected_mot_mr_evaluated_trips
):
    evaluated_trips = evaluate_trips_margin_of_tolerance(trips, mot_mr_compliant_trips)

    pd.testing.assert_frame_equal(evaluated_trips, expected_mot_mr_evaluated_trips)


def test_compute_vessels_risk_elements(
    evaluated_trips, trips, expected_computed_vessels_risk_elements
):
    computed_vessels_risk_elements = compute_vessels_risk_elements(
        evaluated_trips, trips, RiskElement.MOT_MR
    )
    pd.testing.assert_frame_equal(
        computed_vessels_risk_elements, expected_computed_vessels_risk_elements
    )


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


def test_compute_occurrences_vessels_risk_elements(
    vessels, occurrences, expected_computed_occurrences_vessels_risk_elements
):
    computed_vessels_risk_elements = compute_occurrences_vessels_risk_elements(
        vessels, occurrences, RiskElement.CLA_CM
    )
    pd.testing.assert_frame_equal(
        computed_vessels_risk_elements,
        expected_computed_occurrences_vessels_risk_elements,
    )
