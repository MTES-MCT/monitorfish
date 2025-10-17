from datetime import datetime, timedelta

import pandas as pd
from pytest import fixture

from src.flows.trips_snapshot import (
    extract_historical_trips,
    extract_latest_trips,
    trips_flow,
)


@fixture
def expected_latest_days() -> pd.DataFrame:
    now = datetime.utcnow()
    h = timedelta(hours=1)
    d = timedelta(days=1)
    return pd.DataFrame(
        {
            "cfr": ["ABC000306959"],
            "trip_number": ["20210001"],
            "departure_datetime_utc": [now - 2 * d],
            "first_coe_datetime_utc": [None],
            "last_cox_datetime_utc": [None],
            "first_far_datetime_utc": [now - d - 6 * h],
            "last_far_datetime_utc": [now - d - 6 * h],
            "eof_datetime_utc": [None],
            "return_to_port_datetime_utc": [None],
            "end_of_landing_datetime_utc": [None],
            "sort_order_datetime_utc": [now - 2 * d],
        }
    )


def test_extract_latest_trips(reset_test_data, expected_latest_days):
    s = timedelta(seconds=1)
    latest_trips = extract_latest_trips(nb_days=3)
    datetime_cols = [
        "departure_datetime_utc",
        "first_far_datetime_utc",
        "last_far_datetime_utc",
        "sort_order_datetime_utc",
    ]

    for col in datetime_cols:
        assert (abs(latest_trips[col] - expected_latest_days[col]) < 10 * s).all()

    pd.testing.assert_frame_equal(
        expected_latest_days.drop(columns=datetime_cols),
        latest_trips.drop(columns=datetime_cols),
    )


def test_extract_historical_trips(reset_test_data, add_activity_dates_table):
    historical_trips = extract_historical_trips()

    sample_trip = historical_trips.query("cfr == 'SOCR4T3'").iloc[0].to_dict()
    assert sample_trip == {
        "cfr": "SOCR4T3",
        "trip_number": "SRC-TRP-TTT20200506194051795",
        "departure_datetime_utc": pd.Timestamp(
            "2020-05-06 11:39:33.176000+0000", tz="UTC"
        ),
        "first_coe_datetime_utc": pd.Timestamp("2021-01-22 09:00:00+0000", tz="UTC"),
        "last_cox_datetime_utc": pd.Timestamp(
            "2020-05-06 11:40:57.580000+0000", tz="UTC"
        ),
        "first_far_datetime_utc": pd.Timestamp("2020-04-29 12:00:00+0000", tz="UTC"),
        "last_far_datetime_utc": pd.Timestamp(
            "2020-05-06 11:40:22.885000+0000", tz="UTC"
        ),
        "eof_datetime_utc": pd.NaT,
        "return_to_port_datetime_utc": pd.Timestamp(
            "2020-05-06 11:41:20.712000+0000", tz="UTC"
        ),
        "end_of_landing_datetime_utc": pd.Timestamp(
            "2020-05-05 19:41:26.516000+0000", tz="UTC"
        ),
        "sort_order_datetime_utc": pd.Timestamp(
            "2020-05-06 11:39:33.176000+0000", tz="UTC"
        ),
    }


def test_flow(reset_test_data, add_activity_dates_table):
    state = trips_flow(return_state=True)
    assert state.is_completed()
