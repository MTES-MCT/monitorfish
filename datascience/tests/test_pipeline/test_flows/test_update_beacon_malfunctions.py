from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.update_beacon_malfunctions import (
    extract_beacons_last_emission,
    extract_known_malfunctions,
    flow,
    get_beacon_malfunctions_with_resumed_transmission,
    get_current_malfunctions,
    get_new_malfunctions,
    get_vessels_emitting,
    load_new_beacons_malfunctions,
    prepare_new_beacon_malfunctions,
)
from src.read_query import read_query
from tests.mocks import mock_datetime_utcnow


def test_extract_beacons_last_emission_selects_the_right_vessels(reset_test_data):
    beacons_last_emission = extract_beacons_last_emission.run()
    assert set(beacons_last_emission.ircs) == {"FQ7058", "OLY7853"}


def test_extract_known_malfunctions(reset_test_data):
    malfunctions = extract_known_malfunctions.run()
    assert set(malfunctions.ircs) == {"OLY7853"}


def test_get_current_malfunctions_filters_on_max_duration_at_sea_and_at_port():
    d = datetime(2021, 10, 8, 2, 56, 0)
    td = timedelta(hours=1)
    beacons_last_emission = pd.DataFrame(
        {
            "vessel_id": ["A", "B", "C", "D", "E", "F"],
            "last_position_datetime_utc": [
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
            ],
            "is_at_port": [True, True, True, False, False, False],
        }
    )
    current_malfunctions = get_current_malfunctions.run(
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea=d - 6 * td,
        malfunction_datetime_utc_threshold_at_port=d - 24 * td,
    )

    expected_current_malfunctions = (
        beacons_last_emission.loc[[2, 4, 5]]
        .reset_index(drop=True)
        .rename(columns={"last_position_datetime_utc": "malfunction_start_date_utc"})
    )

    pd.testing.assert_frame_equal(current_malfunctions, expected_current_malfunctions)


def test_get_vessels_emitting_filters_on_max_duration_at_sea_and_at_port():
    d = datetime(2021, 10, 8, 2, 56, 0)
    td = timedelta(hours=1)
    beacons_last_emission = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D", "E", "F"],
            "external_immatriculation": ["AA", "BB", "CC", "DD", "EE", "FF"],
            "ircs": ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF"],
            "last_position_datetime_utc": [
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
            ],
            "is_at_port": [True, True, True, False, False, False],
        }
    )
    vessels_emitting = get_vessels_emitting.run(
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea=d - 6 * td,
        malfunction_datetime_utc_threshold_at_port=d - 24 * td,
    )

    expected_vessels_emitting = beacons_last_emission.loc[
        [0, 1, 3], ["cfr", "external_immatriculation", "ircs"]
    ].reset_index(drop=True)

    pd.testing.assert_frame_equal(vessels_emitting, expected_vessels_emitting)


def test_get_new_malfunctions():
    current_malfunctions = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D"],
            "ircs": ["AAA", "BBB", "CCC", "DDD"],
            "external_immatriculation": ["AA", "BB", "CC", "DD"],
            "some_more_data": [1.0, 2.3, None, 1.23],
        }
    )

    known_malfunctions = pd.DataFrame(
        {
            "cfr": ["A", None],
            "ircs": ["AAA", "CCC"],
            "external_immatriculation": ["AA", "CC_different"],
            "some_more_data": [1.0, None],
        }
    )

    new_malfunctions = get_new_malfunctions.run(
        current_malfunctions=current_malfunctions, known_malfunctions=known_malfunctions
    )

    expected_new_malfunctions = current_malfunctions.loc[[1, 3], :]

    pd.testing.assert_frame_equal(new_malfunctions, expected_new_malfunctions)


def test_get_beacon_malfunctions_with_resumed_transmission():
    vessels_emitting = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D"],
            "ircs": ["AAA", "BBB", "CCC", "DDD"],
            "external_immatriculation": ["AA", "BB", "CC", "DD"],
            "some_more_data": [1.0, 2.3, None, 1.23],
        }
    )

    known_malfunctions = pd.DataFrame(
        {
            "id": [12, 48, 256],
            "cfr": ["A", None, "E"],
            "ircs": ["AAA", "CCC", "EEE"],
            "external_immatriculation": ["AA", "CC_different", "EE"],
            "some_more_data": [1.0, None, 569.2],
        }
    )

    emission_restarts = get_beacon_malfunctions_with_resumed_transmission.run(
        known_malfunctions=known_malfunctions, vessels_emitting=vessels_emitting
    )

    expected_emission_restarts = {48, 12}

    assert set(emission_restarts) == expected_emission_restarts


@patch(
    "src.pipeline.flows.update_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_prepare_new_beacon_malfunctions():

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

    beacon_malfunctions = prepare_new_beacon_malfunctions.run(new_malfunctions)

    expected_beacon_malfunctions = pd.DataFrame(
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

    pd.testing.assert_frame_equal(beacon_malfunctions, expected_beacon_malfunctions)


def test_load_new_beacon_malfunctions(reset_test_data):
    new_beacon_malfunctions = pd.DataFrame(
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

    load_new_beacons_malfunctions.run(new_beacon_malfunctions)

    loaded_beacon_malfunctions = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_malfunctions"
    )

    assert len(loaded_beacon_malfunctions) == 4
    pd.testing.assert_series_equal(
        loaded_beacon_malfunctions.internal_reference_number,
        pd.Series(["ABC000542519", None, "B", "D"], name="internal_reference_number"),
    )


def test_update_beacon_malfunctions_flow_doesnt_insert_already_known_malfunctions(
    reset_test_data,
):
    initial_beacons_malfunctions = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_malfunctions"
    )
    flow.schedule = None
    state = flow.run(
        max_hours_without_emission_at_sea=6, max_hours_without_emission_at_port=24
    )
    loaded_beacons_malfunctions = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_malfunctions"
    )

    assert state.is_successful()
    assert len(state.result[flow.get_tasks("get_current_malfunctions")[0]].result) == 1
    assert len(state.result[flow.get_tasks("get_new_malfunctions")[0]].result) == 0
    assert len(loaded_beacons_malfunctions) == len(initial_beacons_malfunctions)


def test_update_beacon_malfunctions_flow_moves_beacon_malfunctions_to_end_of_malfunction(
    reset_test_data,
):
    beacon_malfunction_id_to_move_to_end_of_malfunction = read_query(
        "monitorfish_remote",
        "SELECT id FROM beacon_malfunctions WHERE ircs = 'OLY7853'",
    ).iloc[0, 0]

    flow.schedule = None
    endpoint_mock_url = "http://beacon.malfunctions.endpoint/"
    with patch(
        "src.pipeline.flows.update_beacon_malfunctions.requests"
    ) as mock_requests:
        with patch(
            "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
            endpoint_mock_url,
        ):
            state = flow.run(
                max_hours_without_emission_at_sea=12,
                max_hours_without_emission_at_port=24,
            )

    assert state.is_successful()
    assert (
        len(state.result[flow.get_tasks("extract_known_malfunctions")[0]].result) == 1
    )
    assert len(state.result[flow.get_tasks("get_current_malfunctions")[0]].result) == 0
    assert len(state.result[flow.get_tasks("get_new_malfunctions")[0]].result) == 0
    assert len(state.result[flow.get_tasks("update_beacon_malfunction")[0]].result) == 1

    mock_requests.put.assert_called_once_with(
        url=endpoint_mock_url
        + f"{beacon_malfunction_id_to_move_to_end_of_malfunction}",
        json={"stage": "END_OF_MALFUNCTION"},
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
        },
    )


def test_update_beacon_malfunctions_flow_inserts_new_malfunctions(reset_test_data):
    flow.schedule = None
    initial_beacon_malfunctions = read_query(
        "monitorfish_remote",
        "SELECT * FROM beacon_malfunctions WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')",
    )
    state = flow.run(
        max_hours_without_emission_at_sea=6, max_hours_without_emission_at_port=1
    )
    loaded_beacons_malfunctions = read_query(
        "monitorfish_remote",
        "SELECT * FROM beacon_malfunctions WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')",
    )

    assert state.is_successful()
    assert (
        len(state.result[flow.get_tasks("extract_known_malfunctions")[0]].result) == 1
    )
    assert len(state.result[flow.get_tasks("get_current_malfunctions")[0]].result) == 2
    assert len(state.result[flow.get_tasks("get_new_malfunctions")[0]].result) == 1
    assert len(initial_beacon_malfunctions) == 1
    assert len(loaded_beacons_malfunctions) == 2
    assert "FQ7058" not in initial_beacon_malfunctions.ircs.values
    assert "FQ7058" in loaded_beacons_malfunctions.ircs.values
