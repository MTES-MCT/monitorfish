from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest

from config import BEACON_MALFUNCTIONS_ENDPOINT
from src.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionVesselStatus,
    BeaconStatus,
)
from src.exceptions import MonitorfishHealthError
from src.flows.update_beacon_malfunctions import (
    BeaconMalfunctionStage,
    EndOfMalfunctionReason,
    extract_known_malfunctions,
    extract_last_positions,
    extract_satellite_operators_statuses,
    extract_vessels_that_should_emit,
    get_ended_malfunction_ids,
    get_last_emissions_of_vessels_that_should_emit,
    get_new_malfunctions,
    update_beacon_malfunctions_flow,
)
from src.read_query import read_query
from tests.mocks import (
    extract_satellite_operators_statuses_mock_factory,
    get_monitorfish_healthcheck_mock_factory,
)

mock_get_monitorfish_healthcheck = get_monitorfish_healthcheck_mock_factory()
mock_extract_satellite_operators_statuses = (
    extract_satellite_operators_statuses_mock_factory(True, True)
)


def test_extract_last_positions_selects_all_vessels(reset_test_data):
    last_positions = extract_last_positions()
    assert set(last_positions.ircs) == {
        "FQ7058",
        "OLY7853",
        "IL2468",
        "ZZ000000",
    }


def test_extract_known_malfunctions(reset_test_data):
    malfunctions = extract_known_malfunctions()

    expected_malfunctions = pd.DataFrame(
        {
            "id": [2, 3, 4, 5, 6],
            "beacon_number": [
                "A56CZ2",
                "BEA951357",
                "BEACON_NOT_EMITTING",
                "987654",
                "NEW_BEACON_ACT_DET",
            ],
            "vessel_status": [
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
            ],
            "satellite_operator_id": [2, 2, 2, 1, 1],
        }
    )
    pd.testing.assert_frame_equal(
        malfunctions.sort_values("id").reset_index(drop=True), expected_malfunctions
    )


def test_extract_vessels_that_should_emit(reset_test_data):
    vessels_that_should_emit = extract_vessels_that_should_emit()
    expected_beacon_numbers_and_statuses = pd.DataFrame(
        {
            "vessel_id": [2, 4, 5, 6, 8],
            "beacon_number": [
                "123456",
                "A56CZ2",
                "BEACON_NOT_EMITTING",
                "BEA951357",
                "NEW_BEACON_ACT_DET",
            ],
            "beacon_status": [
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
            ],
            "satellite_operator_id": [1, 2, 2, 2, 1],
        }
    )
    pd.testing.assert_frame_equal(
        (
            vessels_that_should_emit[
                ["vessel_id", "beacon_number", "beacon_status", "satellite_operator_id"]
            ]
            .sort_values("vessel_id")
            .reset_index(drop=True)
        ),
        expected_beacon_numbers_and_statuses,
    )


def test_extract_satellite_operators_statuses(reset_test_data):
    statuses = extract_satellite_operators_statuses()
    expected_statuses = pd.DataFrame(
        {"satellite_operator_id": [1, 2], "operator_is_up": [False, False]}
    )

    pd.testing.assert_frame_equal(statuses, expected_statuses)


def test_get_last_emissions():
    d = datetime(2021, 10, 8, 2, 56, 0)
    td = timedelta(hours=1)

    vessels_that_should_emit = pd.DataFrame(
        {
            "cfr": [None, "C", "E", "F"],
            "ircs": ["AA", "CC", "EE", "FF"],
            "external_immatriculation": ["AAA", None, "EEE", "FFF"],
            "beacon_number": ["K1", "K2", "K3", "K4"],
            "other_vessels_data": ["what", "ever", "you", "want"],
            "logging_datetime_utc": [d, d, d, d],
        }
    )
    last_positions = pd.DataFrame(
        {
            "cfr": ["A", None, "C", "C", "D", "E"],
            "ircs": ["AA", "AA", "CC", "incorrect CC", None, "EE"],
            "external_immatriculation": [
                "AAA",
                "AAA",
                "CCC",
                "incorrect CCC",
                "DDD",
                "EEE",
            ],
            "last_position_datetime_utc": [
                d,
                d + 48 * td,
                d + 6 * td,
                d + 54 * td,
                d,
                d - 12 * td,
            ],
            "other_last_positions_data": ["i", "am", "the", "captain", "of", "my soul"],
        }
    )

    last_emissions = get_last_emissions_of_vessels_that_should_emit(
        vessels_that_should_emit, last_positions
    )

    expected_last_emissions = (
        vessels_that_should_emit.loc[[1, 0, 2, 3]]
        .reset_index(drop=True)
        .assign(
            last_position_datetime_utc=[d + 54 * td, d + 48 * td, None, None],
            other_last_positions_data=["captain", "am", "my soul", None],
        )
    )

    pd.testing.assert_frame_equal(
        last_emissions.convert_dtypes(), expected_last_emissions.convert_dtypes()
    )


# The `LEFT JOIN` in known_beacon_malfunctions.sql can return rows with
# `satellite_operator_id` = NULL, which results in a change of dtype of the
# `satellite_operator_id` column of the known_malfunctions DataFrame from `int` to
# `float`. As a safe measure, a test is made with both cases, with or without nulls in
# the `satellite_operator_id` column.
@pytest.mark.parametrize(
    "satellite_operator_ids_contain_nulls",
    [False, True],
)
def test_get_new_malfunctions(satellite_operator_ids_contain_nulls):
    d = datetime(2021, 10, 8, 2, 56, 0)
    td = timedelta(hours=1)
    known_malfunctions = pd.DataFrame(
        {
            "beacon_number": ["K1", "K3"],
            "other_malfunctions_data": [1, "Three"],
        }
    )
    last_emissions = pd.DataFrame(
        {
            "beacon_number": ["A", "B", "C", "D", "E", "F", "G", "K3", "I"],
            "last_position_datetime_utc": [
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
                d - 2 * td,
                d - 8 * td,
                None,
            ],
            "is_at_port": [False, True, True, False, False, False, False, False, None],
            "is_manual": [True, False, False, False, False, False, False, False, None],
            "satellite_operator_id": [
                1,
                2,
                3,
                1,
                2,
                3 if not satellite_operator_ids_contain_nulls else None,
                4,
                5,
                6,
            ],
            "other_emissions_data": [10, "twenty", "thirty", 40, 50, 60, 70, 80, None],
        }
    )

    satellite_operators_statuses = pd.DataFrame(
        {
            "satellite_operator_id": [1, 2, 3, 4, 5, 6, 7],
            "operator_is_up": [True, True, True, True, True, True, True],
        }
    )

    new_malfunctions = get_new_malfunctions(
        last_emissions,
        known_malfunctions,
        satellite_operators_statuses,
        malfunction_datetime_utc_threshold_at_sea=d - 6 * td,
        malfunction_datetime_utc_threshold_at_port=d - 24 * td,
    )

    expected_new_malfunctions_ids = [0, 2, 4]
    if not satellite_operator_ids_contain_nulls:
        expected_new_malfunctions_ids.append(5)

    expected_new_malfunctions = (
        last_emissions.loc[
            expected_new_malfunctions_ids,
            [
                "beacon_number",
                "last_position_datetime_utc",
                "is_at_port",
                "other_emissions_data",
            ],
        ]
        .rename(columns={"last_position_datetime_utc": "malfunction_start_date_utc"})
        .reset_index(drop=True)
    )

    pd.testing.assert_frame_equal(new_malfunctions, expected_new_malfunctions)

    satellite_operators_statuses = pd.DataFrame(
        {
            "satellite_operator_id": [1, 2, 3, 4, 5, 6, 7],
            "operator_is_up": [True, None, False, True, True, True, True],
        }
    )

    new_malfunctions = get_new_malfunctions(
        last_emissions,
        known_malfunctions,
        satellite_operators_statuses,
        malfunction_datetime_utc_threshold_at_sea=d - 6 * td,
        malfunction_datetime_utc_threshold_at_port=d - 24 * td,
    )

    expected_new_malfunctions = (
        last_emissions.loc[
            [0],
            [
                "beacon_number",
                "last_position_datetime_utc",
                "is_at_port",
                "other_emissions_data",
            ],
        ]
        .rename(columns={"last_position_datetime_utc": "malfunction_start_date_utc"})
        .reset_index(drop=True)
    )

    pd.testing.assert_frame_equal(new_malfunctions, expected_new_malfunctions)


def test_get_ended_malfunction_ids():
    d = datetime(2021, 10, 8, 2, 56, 0)
    td = timedelta(hours=1)
    known_malfunctions = pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6, 7],
            "beacon_number": ["K1", "K3", "J", "JJ", "K", "L", "M"],
            "other_malfunctions_data": [1, "Three", "J", "JJ", "KK", "LL", "MM"],
        }
    )
    last_emissions = pd.DataFrame(
        {
            "beacon_number": [
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "K3",
                "I",
                "J",
                "JJ",
                "K",
                "L",
                "M",
            ],
            "last_position_datetime_utc": [
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
                d - 2 * td,
                d - 8 * td,
                d - 48 * td,
                d - 2 * td,
                d - 8 * td,
                None,
                d - 2 * td,
                d - 2 * td,
                d - 2 * td,
                d - 2 * td,
                d - 2 * td,
            ],
            "is_at_port": [
                False,
                True,
                True,
                False,
                False,
                False,
                False,
                False,
                None,
                False,
                False,
                False,
                False,
                True,
            ],
            "is_manual": [
                True,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                None,
                False,
                False,
                False,
                False,
                False,
            ],
            "beacon_status": [
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
            ],
            "vessel_status": [
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.ACTIVITY_DETECTED.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.ACTIVITY_DETECTED.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.AT_PORT.value,
                BeaconMalfunctionVesselStatus.AT_PORT.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.AT_PORT.value,
            ],
        }
    )

    malfunction_datetime_utc_threshold_at_sea = d - 6 * td

    (
        ids_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) = get_ended_malfunction_ids(
        last_emissions, known_malfunctions, malfunction_datetime_utc_threshold_at_sea
    )

    assert ids_restarted_emitting == [3, 4, 6, 7]
    assert ids_not_required_to_emit == [1]
    assert ids_unsupervised_restarted_emitting == [5]


@patch(
    "src.flows.update_beacon_malfunctions.get_monitorfish_healthcheck",
    mock_get_monitorfish_healthcheck,
)
def test_update_beacon_malfunctions_flow_doesnt_create_malfunctions_if_never_emitted(
    reset_test_data,
):
    initial_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions", db="monitorfish_remote"
    )
    with patch("src.shared_tasks.beacon_malfunctions.requests"):
        state = update_beacon_malfunctions_flow(
            max_hours_without_emission_at_sea=6,
            max_hours_without_emission_at_port=24,
            extract_satellite_operators_statuses_fn=mock_extract_satellite_operators_statuses,
            return_state=True,
        )

    assert state.is_completed()

    final_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions", db="monitorfish_remote"
    )

    (
        new_malfunctions,
        _,
        _,
        _,
    ) = state.result()
    assert len(new_malfunctions) == 0
    assert len(final_beacons_malfunctions) == len(initial_beacons_malfunctions)


@patch(
    "src.flows.update_beacon_malfunctions.get_monitorfish_healthcheck",
    mock_get_monitorfish_healthcheck,
)
def test_update_beacon_malfunctions_flow_moves_malfunctions_to_end_of_malfunction(
    reset_test_data,
):
    beacon_malfunction_id_to_move_to_archived_and_notify = read_query(
        "SELECT id FROM beacon_malfunctions WHERE ircs = 'OLY7853'",
        db="monitorfish_remote",
    ).iloc[0, 0]

    beacon_malfunction_id_to_archive = read_query(
        "SELECT id FROM beacon_malfunctions WHERE ircs = 'RV348407'",
        db="monitorfish_remote",
    ).iloc[0, 0]

    with patch("src.shared_tasks.beacon_malfunctions.requests") as mock_requests:
        state = update_beacon_malfunctions_flow(
            max_hours_without_emission_at_sea=12,
            max_hours_without_emission_at_port=24,
            extract_satellite_operators_statuses_fn=mock_extract_satellite_operators_statuses,
            return_state=True,
        )

    assert state.is_completed()

    (
        new_malfunctions,
        ids_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) = state.result()

    assert len(new_malfunctions) == 0

    assert (
        ids_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) == (
        [beacon_malfunction_id_to_move_to_archived_and_notify],
        [beacon_malfunction_id_to_archive],
        [],
    )
    assert mock_requests.put.call_count == 3

    mock_requests.put.assert_any_call(
        url=BEACON_MALFUNCTIONS_ENDPOINT
        + f"{beacon_malfunction_id_to_move_to_archived_and_notify}",
        json={
            "stage": BeaconMalfunctionStage.ARCHIVED.value,
            "endOfBeaconMalfunctionReason": EndOfMalfunctionReason.RESUMED_TRANSMISSION.value,
        },
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
            "X-API-KEY": "backend_api_key",
        },
    )

    mock_requests.put.assert_any_call(
        url=BEACON_MALFUNCTIONS_ENDPOINT
        + f"{beacon_malfunction_id_to_move_to_archived_and_notify}/"
        + f"{BeaconMalfunctionNotificationType.END_OF_MALFUNCTION.value}",
        headers={
            "X-API-KEY": "backend_api_key",
        },
    )

    mock_requests.put.assert_any_call(
        url=BEACON_MALFUNCTIONS_ENDPOINT + f"{beacon_malfunction_id_to_archive}",
        json={
            "stage": "ARCHIVED",
            "endOfBeaconMalfunctionReason": "BEACON_DEACTIVATED_OR_UNEQUIPPED",
        },
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
            "X-API-KEY": "backend_api_key",
        },
    )


@patch(
    "src.flows.update_beacon_malfunctions.get_monitorfish_healthcheck",
    mock_get_monitorfish_healthcheck,
)
def test_update_beacon_malfunctions_flow_inserts_new_malfunctions(reset_test_data):
    initial_beacon_malfunctions = read_query(
        ("SELECT * FROM beacon_malfunctions " "WHERE stage != 'ARCHIVED'"),
        db="monitorfish_remote",
    )

    with patch("src.shared_tasks.beacon_malfunctions.requests"):
        state = update_beacon_malfunctions_flow(
            max_hours_without_emission_at_sea=6,
            max_hours_without_emission_at_port=1,
            extract_satellite_operators_statuses_fn=mock_extract_satellite_operators_statuses,
            return_state=True,
        )
    loaded_beacon_malfunctions = read_query(
        ("SELECT * FROM beacon_malfunctions " "WHERE stage != 'ARCHIVED'"),
        db="monitorfish_remote",
    )

    assert state.is_completed()

    (
        new_malfunctions,
        ids_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) = state.result()

    assert len(new_malfunctions) == 1
    assert len(initial_beacon_malfunctions) == 5
    assert len(loaded_beacon_malfunctions) == 6
    assert "FQ7058" not in initial_beacon_malfunctions.ircs.values
    assert "FQ7058" in loaded_beacon_malfunctions.ircs.values

    expected_new_malfunctions_beacons_and_notifications = pd.DataFrame(
        {
            "vessel_id": [2],
            "beacon_number": ["123456"],
            "beacon_status_at_malfunction_creation": [
                BeaconStatus.ACTIVATED.value,
            ],
            "notification_requested": [
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
            ],
        }
    )

    pd.testing.assert_frame_equal(
        (
            new_malfunctions[list(expected_new_malfunctions_beacons_and_notifications)]
            .sort_values("vessel_id")
            .reset_index(drop=True)
        ),
        expected_new_malfunctions_beacons_and_notifications,
    )

    # Running the flow again should not add any more malfunctions
    initial_beacon_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions", db="monitorfish_remote"
    )

    with patch("src.shared_tasks.beacon_malfunctions.requests"):
        state = update_beacon_malfunctions_flow(
            max_hours_without_emission_at_sea=6,
            max_hours_without_emission_at_port=1,
            extract_satellite_operators_statuses_fn=mock_extract_satellite_operators_statuses,
            return_state=True,
        )

    assert state.is_completed()

    loaded_beacon_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions",
        db="monitorfish_remote",
    )

    pd.testing.assert_frame_equal(
        initial_beacon_malfunctions, loaded_beacon_malfunctions
    )


@patch(
    "src.flows.update_beacon_malfunctions.get_monitorfish_healthcheck",
    mock_get_monitorfish_healthcheck,
)
def test_flow_does_not_create_malfunctions_for_operators_that_are_not_up(
    reset_test_data,
):
    mock_extract_satellite_operators_statuses = (
        extract_satellite_operators_statuses_mock_factory(False, None)
    )

    initial_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id",
        db="monitorfish_remote",
    )

    with patch("src.shared_tasks.beacon_malfunctions.requests"):
        state = update_beacon_malfunctions_flow(
            max_hours_without_emission_at_sea=6,
            max_hours_without_emission_at_port=24,
            extract_satellite_operators_statuses_fn=mock_extract_satellite_operators_statuses,
            return_state=True,
        )

    assert state.is_completed()

    final_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id",
        db="monitorfish_remote",
    )

    pd.testing.assert_frame_equal(
        initial_beacons_malfunctions, final_beacons_malfunctions
    )


@patch(
    "src.flows.update_beacon_malfunctions.get_monitorfish_healthcheck",
    get_monitorfish_healthcheck_mock_factory(
        last_position_updated_by_prefect_minutes_ago=15
    ),
)
def test_flow_fails_if_last_positions_healthcheck_fails(reset_test_data):
    initial_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id",
        db="monitorfish_remote",
    )

    state = update_beacon_malfunctions_flow(
        extract_satellite_operators_statuses_fn=mock_extract_satellite_operators_statuses,
        return_state=True,
    )

    assert state.is_failed()
    with pytest.raises(MonitorfishHealthError):
        state.result()

    final_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id",
        db="monitorfish_remote",
    )

    pd.testing.assert_frame_equal(
        initial_beacons_malfunctions, final_beacons_malfunctions
    )
