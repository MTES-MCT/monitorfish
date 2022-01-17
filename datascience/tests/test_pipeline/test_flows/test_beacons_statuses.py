from datetime import datetime
from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.new_beacons_statuses import (
    compute_current_malfunctions,
    extract_known_malfunctions,
    flow,
    get_new_malfunctions,
    load_new_beacons_statuses,
    prepare_new_beacons_statuses,
)
from src.read_query import read_query
from tests.mocks import mock_datetime_utcnow


def test_compute_current_malfunctions(
    reset_test_data,
):
    malfunctions = compute_current_malfunctions.run(min_duration=6)
    assert set(malfunctions.ircs) == {"OLY7853"}

    malfunctions = compute_current_malfunctions.run(min_duration=1)
    assert set(malfunctions.ircs) == {"FQ7058", "OLY7853"}


def test_extract_known_malfunctions(reset_test_data):
    malfunctions = extract_known_malfunctions.run()
    assert set(malfunctions.ircs) == {"OLY7853"}


def test_get_new_malfunctions(reset_test_data):
    current_malfunctions = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D"],
            "external_immatriculation": ["AA", "BB", "CC", "DD"],
            "ircs": ["AAA", "BBB", "CCC", "DDD"],
            "some_more_data": [1.0, 2.3, None, 1.23],
        }
    )

    known_malfunctions = pd.DataFrame(
        {
            "cfr": ["A", None],
            "external_immatriculation": ["AA", "CC_different"],
            "ircs": ["AAA", "CCC"],
            "some_more_data": [1.0, None],
        }
    )

    filtered_malfunctions = get_new_malfunctions.run(
        current_malfunctions=current_malfunctions, known_malfunctions=known_malfunctions
    )

    expected_filtered_malfunctions = current_malfunctions.loc[[1, 3], :]

    pd.testing.assert_frame_equal(filtered_malfunctions, expected_filtered_malfunctions)


@patch(
    "src.pipeline.flows.new_beacons_statuses.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_prepare_new_beacons_statuses():

    new_malfunctions = pd.DataFrame(
        {
            "cfr": ["B", "D"],
            "external_immatriculation": ["BB", "DD"],
            "ircs": ["BBB", "DDD"],
            "vessel_name": ["BBBB", "DDDD"],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER", "IRCS"],
            "is_at_port": [True, False],
            "priority": [False, True],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
            ],
        }
    )

    beacons_statuses = prepare_new_beacons_statuses.run(new_malfunctions)

    expected_beacons_statuses = pd.DataFrame(
        {
            "internal_reference_number": ["B", "D"],
            "external_reference_number": ["BB", "DD"],
            "ircs": ["BBB", "DDD"],
            "vessel_name": ["BBBB", "DDDD"],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER", "IRCS"],
            "vessel_status": ["AT_PORT", "AT_SEA"],
            "stage": ["INITIAL_ENCOUNTER", "INITIAL_ENCOUNTER"],
            "priority": [False, True],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
            ],
            "malfunction_end_date_utc": [pd.NaT, pd.NaT],
            "vessel_status_last_modification_date_utc": [
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
        }
    )

    pd.testing.assert_frame_equal(beacons_statuses, expected_beacons_statuses)


def test_load_new_beacons_statuses(reset_test_data):
    beacons_new_statuses = pd.DataFrame(
        {
            "internal_reference_number": ["B", "D"],
            "external_reference_number": ["BB", "DD"],
            "ircs": ["BBB", "DDD"],
            "vessel_name": ["BBBB", "DDDD"],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER", "IRCS"],
            "vessel_status": ["AT_PORT", "AT_SEA"],
            "stage": ["INITIAL_ENCOUNTER", "INITIAL_ENCOUNTER"],
            "priority": [False, True],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
            ],
            "malfunction_end_date_utc": [pd.NaT, pd.NaT],
            "vessel_status_last_modification_date_utc": [
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
        }
    )

    load_new_beacons_statuses.run(beacons_new_statuses)

    loaded_beacons_statuses = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_statuses"
    )

    assert len(loaded_beacons_statuses) == 4
    pd.testing.assert_series_equal(
        loaded_beacons_statuses.internal_reference_number,
        pd.Series(["ABC000542519", None, "B", "D"], name="internal_reference_number"),
    )


def test_new_beacons_statuses_flow_doesnt_insert_already_known_malfunctions(
    reset_test_data,
):
    flow.schedule = None
    flow.run(min_duration=1)
    loaded_beacons_statuses = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_statuses"
    )
    assert len(loaded_beacons_statuses) == 3


def test_new_beacons_statuses_flow_inserts_new_malfunctions(reset_test_data):
    flow.schedule = None
    flow.run(min_duration=6)
    loaded_beacons_statuses = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_statuses"
    )
    assert len(loaded_beacons_statuses) == 2
