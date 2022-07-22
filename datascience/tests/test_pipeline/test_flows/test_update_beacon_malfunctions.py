from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest
from prefect.engine.signals import TRIGGERFAIL

from src.pipeline.entities.beacon_malfunctions import BeaconMalfunctionNotificationType
from src.pipeline.exceptions import MonitorfishHealthError
from src.pipeline.flows.update_beacon_malfunctions import (
    BeaconMalfunctionStage,
    BeaconMalfunctionVesselStatus,
    EndOfMalfunctionReason,
    extract_beacons_last_emission,
    extract_known_malfunctions,
    extract_vessels_less_than_twelve_meters_to_monitor,
    extract_vessels_with_beacon,
    flow,
    get_current_malfunctions,
    get_ended_beacon_malfunction_ids,
    get_new_malfunctions,
    get_temporarily_unsupervised_vessels,
    get_vessels_emitting,
    get_vessels_that_should_emit,
    load_new_beacon_malfunctions,
    prepare_new_beacon_malfunctions,
    update_beacon_malfunction,
)
from src.pipeline.shared_tasks.beacons import beaconStatus
from src.read_query import read_query
from tests.mocks import get_monitorfish_healthcheck_mock_factory, mock_datetime_utcnow

flow.replace(
    flow.get_tasks("get_monitorfish_healthcheck")[0],
    get_monitorfish_healthcheck_mock_factory(),
)


def test_extract_beacons_last_emission_selects_all_vessels(reset_test_data):
    beacons_last_emission = extract_beacons_last_emission.run()
    assert set(beacons_last_emission.ircs) == {
        "FQ7058",
        "OLY7853",
        "IL2468",
        "ZZ000000",
    }


def test_extract_known_malfunctions(reset_test_data):
    malfunctions = extract_known_malfunctions.run()
    assert set(malfunctions.ircs) == {"OLY7853", "ZZ000000"}


def test_extract_vessels_less_than_twelve_meters_to_monitor():
    vessels = extract_vessels_less_than_twelve_meters_to_monitor.run()
    assert isinstance(vessels, set)


def test_extract_vessels_with_beacon(reset_test_data):
    vessels_that_should_emit = extract_vessels_with_beacon.run()
    assert set(vessels_that_should_emit.ircs) == {
        "FQ7058",
        "OLY7853",
        "AB654321",
        "ZZ000000",
    }
    assert len(vessels_that_should_emit) == 4


def test_get_current_malfunctions_filters_on_max_duration_at_sea_and_at_port_and_is_manual():
    d = datetime(2021, 10, 8, 2, 56, 0)
    td = timedelta(hours=1)
    vessels_that_should_emit = pd.DataFrame(
        {
            "vessel_id": [1, 2, 3, 4, 5, 6, 7, 8, 9],
            "cfr": ["A", "B", "C", None, None, None, "J", None, None],
            "ircs": ["AA", "BB", "CC", "DD", "EE", "FF", "JJ", "KK", None],
            "external_immatriculation": [
                "AAA",
                "BBB",
                "CCC",
                "DDD",
                "EEE",
                "FFF",
                "JJJ",
                "KKK",
                "LLL",
            ],
            "other_vessels_data": [1, 2, 3, 4, 5, 6, 7, 8, "Nine"],
        }
    )
    beacons_last_emission = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
            "ircs": ["AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II"],
            "external_immatriculation": [
                "AAA",
                "BBB",
                "CCC",
                "DDD",
                "EEE",
                "FFF",
                "GGG",
                "HHH",
                "III",
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
                d - 48 * td,
            ],
            "is_at_port": [True, True, True, False, False, False, False, False, False],
            "is_manual": [True, False, False, False, False, False, False, False, False],
            "other_emissions_data": [10, "twenty", "thirty", 40, 50, 60, 70, 80, 90],
        }
    )
    current_malfunctions = get_current_malfunctions.run(
        vessels_that_should_emit,
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea=d - 6 * td,
        malfunction_datetime_utc_threshold_at_port=d - 24 * td,
    )

    expected_current_malfunctions = vessels_that_should_emit.loc[
        [0, 2, 4, 5, 6, 7, 8]
    ].reset_index(drop=True)

    expected_current_malfunctions["malfunction_start_date_utc"] = [
        d - 2 * td,
        d - 48 * td,
        d - 8 * td,
        d - 48 * td,
        None,
        None,
        None,
    ]

    expected_current_malfunctions["other_emissions_data"] = [
        10,
        "thirty",
        50,
        60,
        None,
        None,
        None,
    ]
    expected_current_malfunctions["is_at_port"] = [
        True,
        True,
        False,
        False,
        None,
        None,
        None,
    ]
    expected_current_malfunctions.loc[
        expected_current_malfunctions.ircs == "EE", "cfr"
    ] = "E"
    expected_current_malfunctions.loc[
        expected_current_malfunctions.ircs == "FF", "cfr"
    ] = "F"

    pd.testing.assert_frame_equal(
        current_malfunctions, expected_current_malfunctions, check_like=True
    )


def test_get_ended_beacon_malfunction_ids():
    known_malfunctions = pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6],
            "cfr": ["A", "B", "C", "D", "E", "F"],
            "ircs": ["AA", "BB", "CC", "DD", "EE", "FF"],
            "external_immatriculation": ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF"],
        }
    )

    vessels_emitting = pd.DataFrame(
        {
            "cfr": ["C", "D", "E", "G", "H", "I"],
            "ircs": ["CC", "DD", "EE", "GG", "HH", "II"],
            "external_immatriculation": ["CCC", "DDD", "EEE", "GGG", "HHH", "III"],
        }
    )

    temporarily_unsupervised_vessels = pd.DataFrame(
        {
            "cfr": ["E", "F"],
            "ircs": ["EE", "FF"],
            "external_immatriculation": ["EEE", "FFF"],
        }
    )

    vessels_that_should_emit = pd.DataFrame(
        {
            "cfr": ["B", "C", "I", "J"],
            "ircs": ["BB", "CC", "II", "JJ"],
            "external_immatriculation": ["BBB", "CCC", "III", "JJJ"],
        }
    )

    (
        beacon_malfunctions_with_resumed_transmission,
        beacon_malfunctions_temporarily_unsupervised,
        beacon_malfunctions_permanently_unsupervised,
    ) = get_ended_beacon_malfunction_ids.run(
        known_malfunctions,
        vessels_emitting,
        temporarily_unsupervised_vessels,
        vessels_that_should_emit,
    )

    expected_beacon_malfunctions_with_resumed_transmission = [3]
    expected_beacon_malfunctions_temporarily_unsupervised = [5, 6]
    expected_beacon_malfunctions_permanently_unsupervised = [1, 4]

    assert (
        expected_beacon_malfunctions_with_resumed_transmission
        == beacon_malfunctions_with_resumed_transmission
    )
    assert (
        expected_beacon_malfunctions_temporarily_unsupervised
        == beacon_malfunctions_temporarily_unsupervised
    )
    assert (
        expected_beacon_malfunctions_permanently_unsupervised
        == beacon_malfunctions_permanently_unsupervised
    )


def test_get_vessels_emitting_filters_on_max_duration_at_sea_and_at_port_and_is_manual():
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
            "is_manual": [True, False, False, False, False, False],
        }
    )
    vessels_emitting = get_vessels_emitting.run(
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea=d - 6 * td,
        malfunction_datetime_utc_threshold_at_port=d - 24 * td,
    )

    expected_vessels_emitting = beacons_last_emission.loc[
        [1, 3], ["cfr", "external_immatriculation", "ircs"]
    ].reset_index(drop=True)

    pd.testing.assert_frame_equal(vessels_emitting, expected_vessels_emitting)


def test_get_vessels_that_should_emit():
    vessels_with_beacon = pd.DataFrame(
        {
            "vessel_ids": range(1, 10),
            "cfr": list("ABCDEFGHI"),
            "beacon_status": [
                beaconStatus.ACTIVATED.value,
                beaconStatus.NON_APPROVED.value,
                beaconStatus.UNSUPERVISED.value,
                beaconStatus.IN_TEST.value,
                beaconStatus.DEACTIVATED.value,
                beaconStatus.ACTIVATED.value,
                beaconStatus.ACTIVATED.value,
                beaconStatus.ACTIVATED.value,
                beaconStatus.ACTIVATED.value,
            ],
            "length": [11.5, 11.99, 12, 12.01, 12.5, 25.69, 5.69, 11.56, 36.5],
            "other_data": list("abcdefghi"),
        }
    )

    less_than_twelve_to_monitor = {"A", "E", "F", "G"}

    vessels_that_should_emit = get_vessels_that_should_emit.run(
        vessels_with_beacon, less_than_twelve_to_monitor
    )
    expected_vessels_that_should_emit = vessels_with_beacon.loc[
        [0, 5, 6, 8], ["vessel_ids", "cfr", "length", "other_data"]
    ].reset_index(drop=True)

    pd.testing.assert_frame_equal(
        vessels_that_should_emit, expected_vessels_that_should_emit
    )


def test_get_temporarily_unsupervised_vessels():
    vessels_with_beacon = pd.DataFrame(
        {
            "vessel_ids": [1, 2, 3, 4, 5, 6],
            "other_data": ["A", "B", "C", "D", "E", "F"],
            "beacon_status": [
                beaconStatus.ACTIVATED.value,
                beaconStatus.NON_APPROVED.value,
                beaconStatus.UNSUPERVISED.value,
                beaconStatus.IN_TEST.value,
                beaconStatus.DEACTIVATED.value,
                beaconStatus.ACTIVATED.value,
            ],
        }
    )

    temporarily_unsupervised_vessels = get_temporarily_unsupervised_vessels.run(
        vessels_with_beacon
    )
    expected_temporarily_unsupervised_vessels = vessels_with_beacon.loc[
        [2], ["vessel_ids", "other_data"]
    ].reset_index(drop=True)

    pd.testing.assert_frame_equal(
        temporarily_unsupervised_vessels, expected_temporarily_unsupervised_vessels
    )


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


@patch(
    "src.pipeline.flows.update_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_prepare_new_beacon_malfunctions():

    new_malfunctions = pd.DataFrame(
        {
            "vessel_id": [2, 4, 5],
            "cfr": ["B", "D", "E"],
            "external_immatriculation": ["BB", "DD", "EE"],
            "ircs": ["BBB", "DDD", "EEE"],
            "vessel_name": ["BBBB", "DDDD", "EEEE"],
            "flag_state": ["FR", "VE", "FR"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
                "EXTERNAL_REFERENCE_NUMBER",
            ],
            "is_at_port": [True, False, None],
            "priority": [False, True, False],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
                None,
            ],
            "latitude": [45.23, -12.256, None],
            "longitude": [12.8, -2.961, None],
        }
    )

    beacon_malfunctions = prepare_new_beacon_malfunctions.run(new_malfunctions)

    expected_beacon_malfunctions = pd.DataFrame(
        {
            "internal_reference_number": ["B", "D", "E"],
            "external_reference_number": ["BB", "DD", "EE"],
            "ircs": ["BBB", "DDD", "EEE"],
            "vessel_name": ["BBBB", "DDDD", "EEEE"],
            "flag_state": ["FR", "VE", "FR"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
                "EXTERNAL_REFERENCE_NUMBER",
            ],
            "vessel_status": [
                BeaconMalfunctionVesselStatus.AT_PORT.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.NEVER_EMITTED.value,
            ],
            "stage": [
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
            ],
            "priority": [False, True, False],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
            "malfunction_end_date_utc": [pd.NaT, pd.NaT, pd.NaT],
            "vessel_status_last_modification_date_utc": [
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
            "vessel_id": [2, 4, 5],
            "notification_requested": [
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
            ],
            "latitude": [45.23, -12.256, None],
            "longitude": [12.8, -2.961, None],
        }
    )

    pd.testing.assert_frame_equal(beacon_malfunctions, expected_beacon_malfunctions)


def test_load_new_beacon_malfunctions(reset_test_data):
    initial_beacon_malfunctions = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_malfunctions"
    )

    new_beacon_malfunctions = pd.DataFrame(
        {
            "internal_reference_number": ["B", "D"],
            "external_reference_number": ["BB", "DD"],
            "ircs": ["BBB", "DDD"],
            "vessel_name": ["BBBB", "DDDD"],
            "flag_state": ["FR", "VE"],
            "vessel_identifier": ["INTERNAL_REFERENCE_NUMBER", "IRCS"],
            "vessel_status": [
                BeaconMalfunctionVesselStatus.AT_PORT.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
            ],
            "stage": [
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
            ],
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
            "vessel_id": [2, 4],
            "notification_requested": [
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value,
            ],
            "latitude": [45.23, -12.256],
            "longitude": [12.8, -2.961],
        }
    )

    load_new_beacon_malfunctions.run(new_beacon_malfunctions)

    loaded_beacon_malfunctions = read_query(
        "monitorfish_remote", "SELECT * FROM beacon_malfunctions"
    )

    assert len(loaded_beacon_malfunctions) == len(initial_beacon_malfunctions) + 2
    pd.testing.assert_series_equal(
        loaded_beacon_malfunctions.external_reference_number,
        pd.Series(
            ["RO237719", "SB125334", "ZZTOPACDC", "BB", "DD"],
            name="external_reference_number",
        ),
    )


@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_raises_when_both_stage_and_status_are_supplied(
    mock_requests,
):
    malfunction_id_to_update = 25
    with pytest.raises(ValueError):
        update_beacon_malfunction.run(
            malfunction_id_to_update,
            new_stage=BeaconMalfunctionStage.FOUR_HOUR_REPORT,
            new_vessel_status=BeaconMalfunctionVesselStatus.AT_SEA,
        )


@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_raises_when_reason_is_missing(mock_requests):
    malfunction_id_to_update = 25
    with pytest.raises(ValueError):
        update_beacon_malfunction.run(
            malfunction_id_to_update,
            new_stage=BeaconMalfunctionStage.END_OF_MALFUNCTION,
        )


@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_raises_when_reason_is_unexpected(mock_requests):
    malfunction_id_to_update = 25
    with pytest.raises(ValueError):
        update_beacon_malfunction.run(
            malfunction_id_to_update,
            new_stage=BeaconMalfunctionStage.FOUR_HOUR_REPORT,
            end_of_malfunction_reason=EndOfMalfunctionReason.RESUMED_TRANSMISSION,
        )

    with pytest.raises(ValueError):
        update_beacon_malfunction.run(
            malfunction_id_to_update,
            end_of_malfunction_reason=EndOfMalfunctionReason.RESUMED_TRANSMISSION,
        )


@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_updates_status(mock_requests):
    malfunction_id_to_update = 25
    update_beacon_malfunction.run(
        malfunction_id_to_update,
        new_vessel_status=BeaconMalfunctionVesselStatus.AT_SEA,
    )
    mock_requests.put.assert_called_once_with(
        url=f"dummy/end/point/{malfunction_id_to_update}",
        json={"vesselStatus": "AT_SEA"},
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
        },
    )


@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_updates_stage(mock_requests):
    malfunction_id_to_update = 25
    update_beacon_malfunction.run(
        malfunction_id_to_update,
        new_stage=BeaconMalfunctionStage.FOUR_HOUR_REPORT,
    )
    mock_requests.put.assert_called_once_with(
        url=f"dummy/end/point/{malfunction_id_to_update}",
        json={"stage": "FOUR_HOUR_REPORT"},
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
        },
    )


@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_updates_stage_and_reason(mock_requests):
    malfunction_id_to_update = 25
    update_beacon_malfunction.run(
        malfunction_id_to_update,
        new_stage=BeaconMalfunctionStage.END_OF_MALFUNCTION,
        end_of_malfunction_reason=EndOfMalfunctionReason.RESUMED_TRANSMISSION,
    )
    mock_requests.put.assert_called_once_with(
        url=f"dummy/end/point/{malfunction_id_to_update}",
        json={
            "stage": "END_OF_MALFUNCTION",
            "endOfBeaconMalfunctionReason": "RESUMED_TRANSMISSION",
        },
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
        },
    )


@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_raises_if_no_stage_and_no_status(mock_requests):
    malfunction_id_to_update = 25
    with pytest.raises(ValueError):
        update_beacon_malfunction.run(
            malfunction_id_to_update,
            new_stage=None,
            new_vessel_status=None,
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
    assert len(state.result[flow.get_tasks("get_current_malfunctions")[0]].result) == 3
    assert (
        len(state.result[flow.get_tasks("extract_known_malfunctions")[0]].result) == 2
    )
    assert len(state.result[flow.get_tasks("get_new_malfunctions")[0]].result) == 1
    assert len(loaded_beacons_malfunctions) == len(initial_beacons_malfunctions) + 1


def test_update_beacon_malfunctions_flow_moves_beacon_malfunctions_to_end_of_malfunction(
    reset_test_data,
):
    beacon_malfunction_id_to_move_to_end_of_malfunction = read_query(
        "monitorfish_remote",
        "SELECT id FROM beacon_malfunctions WHERE ircs = 'OLY7853'",
    ).iloc[0, 0]

    beacon_malfunction_id_manual_position = read_query(
        "monitorfish_remote",
        "SELECT id FROM beacon_malfunctions WHERE vessel_name = 'I DO 4H REPORT'",
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
        len(state.result[flow.get_tasks("extract_known_malfunctions")[0]].result) == 2
    )
    assert len(state.result[flow.get_tasks("get_current_malfunctions")[0]].result) == 2
    assert len(state.result[flow.get_tasks("get_new_malfunctions")[0]].result) == 1

    (
        beacon_malfunctions_with_resumed_transmission,
        beacon_malfunctions_temporarily_unsupervised,
        beacon_malfunctions_permanently_unsupervised,
    ) = state.result[flow.get_tasks("get_ended_beacon_malfunction_ids")[0]].result

    assert (
        beacon_malfunction_id_manual_position
        not in beacon_malfunctions_with_resumed_transmission
    )

    mock_requests.put.assert_called_once_with(
        url=endpoint_mock_url
        + f"{beacon_malfunction_id_to_move_to_end_of_malfunction}",
        json={
            "stage": "END_OF_MALFUNCTION",
            "endOfBeaconMalfunctionReason": "RESUMED_TRANSMISSION",
        },
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
    loaded_beacon_malfunctions = read_query(
        "monitorfish_remote",
        "SELECT * FROM beacon_malfunctions WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')",
    )

    assert state.is_successful()
    assert (
        len(state.result[flow.get_tasks("extract_known_malfunctions")[0]].result) == 2
    )
    assert len(state.result[flow.get_tasks("get_current_malfunctions")[0]].result) == 4
    assert len(state.result[flow.get_tasks("get_new_malfunctions")[0]].result) == 2
    assert len(initial_beacon_malfunctions) == 2
    assert len(loaded_beacon_malfunctions) == 4
    assert "FQ7058" not in initial_beacon_malfunctions.ircs.values
    assert "FQ7058" in loaded_beacon_malfunctions.ircs.values
    assert "AB654321" not in initial_beacon_malfunctions.ircs.values
    assert "AB654321" in loaded_beacon_malfunctions.ircs.values
    assert (
        "MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION"
        in loaded_beacon_malfunctions.notification_requested.values
    )


def test_flow_fails_if_last_positions_healthcheck_fails(reset_test_data):

    flow.replace(
        flow.get_tasks("get_monitorfish_healthcheck")[0],
        get_monitorfish_healthcheck_mock_factory(last_position_minutes_ago=15),
    )

    state = flow.run()

    assert not state.is_successful()
    assert isinstance(
        state.result[flow.get_tasks("assert_last_positions_health")[0]].result,
        MonitorfishHealthError,
    )
    assert isinstance(
        state.result[flow.get_tasks("load_new_beacon_malfunctions")[0]].result,
        TRIGGERFAIL,
    )
