from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import pytest
from prefect.engine.signals import TRIGGERFAIL

from config import BEACON_MALFUNCTIONS_ENDPOINT
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconStatus,
)
from src.pipeline.exceptions import MonitorfishHealthError
from src.pipeline.flows.update_beacon_malfunctions import (
    BeaconMalfunctionStage,
    BeaconMalfunctionVesselStatus,
    EndOfMalfunctionReason,
    extract_known_malfunctions,
    extract_last_positions,
    extract_satellite_operators_statuses,
    extract_vessels_that_should_emit,
    flow,
    get_ended_malfunction_ids,
    get_last_emissions_of_vessels_that_should_emit,
    get_new_malfunctions,
    load_new_beacon_malfunctions,
    prepare_new_beacon_malfunctions,
    update_beacon_malfunction,
)
from src.read_query import read_query
from tests.mocks import (
    extract_satellite_operators_statuses_mock_factory,
    get_monitorfish_healthcheck_mock_factory,
    mock_check_flow_not_running,
    mock_datetime_utcnow,
)

flow.replace(
    flow.get_tasks("get_monitorfish_healthcheck")[0],
    get_monitorfish_healthcheck_mock_factory(),
)

flow.replace(
    flow.get_tasks("extract_satellite_operators_statuses")[0],
    extract_satellite_operators_statuses_mock_factory(True, True),
)

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_extract_last_positions_selects_all_vessels(reset_test_data):
    last_positions = extract_last_positions.run()
    assert set(last_positions.ircs) == {
        "FQ7058",
        "OLY7853",
        "IL2468",
        "ZZ000000",
    }


def test_extract_known_malfunctions(reset_test_data):
    malfunctions = extract_known_malfunctions.run()

    expected_malfunctions = pd.DataFrame(
        {
            "id": [2, 3, 4, 5],
            "beacon_number": ["A56CZ2", "BEA951357", "BEACON_NOT_EMITTING", "987654"],
            "vessel_status": [
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
            ],
            "satellite_operator_id": [2, 2, 2, 1],
        }
    )
    pd.testing.assert_frame_equal(
        malfunctions.sort_values("id").reset_index(drop=True), expected_malfunctions
    )


def test_extract_vessels_that_should_emit(reset_test_data):
    vessels_that_should_emit = extract_vessels_that_should_emit.run()
    expected_beacon_numbers_and_statuses = pd.DataFrame(
        {
            "vessel_id": [2, 4, 5, 6],
            "beacon_number": ["123456", "A56CZ2", "BEACON_NOT_EMITTING", "BEA951357"],
            "beacon_status": [
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
                BeaconStatus.ACTIVATED.value,
            ],
            "satellite_operator_id": [1, 2, 2, 2],
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
    statuses = extract_satellite_operators_statuses.run()
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

    last_emissions = get_last_emissions_of_vessels_that_should_emit.run(
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

    pd.testing.assert_frame_equal(last_emissions, expected_last_emissions)


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

    new_malfunctions = get_new_malfunctions.run(
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

    new_malfunctions = get_new_malfunctions.run(
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
        ids_not_at_port_restarted_emitting,
        ids_at_port_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) = get_ended_malfunction_ids.run(
        last_emissions, known_malfunctions, malfunction_datetime_utc_threshold_at_sea
    )

    assert ids_not_at_port_restarted_emitting == [3, 6]
    assert ids_at_port_restarted_emitting == [4]
    assert ids_not_required_to_emit == [1]
    assert ids_unsupervised_restarted_emitting == [5]


@patch(
    "src.pipeline.flows.update_beacon_malfunctions.datetime",
    mock_datetime_utcnow(datetime(2021, 1, 1, 1, 1, 1)),
)
def test_prepare_new_beacon_malfunctions():

    new_malfunctions = pd.DataFrame(
        {
            "vessel_id": [2, 4, 5, 6],
            "cfr": ["B", "D", "E", "F"],
            "external_immatriculation": ["BB", "DD", "EE", "FF"],
            "ircs": ["BBB", "DDD", "EEE", "FFF"],
            "vessel_name": ["BBBB", "DDDD", "EEEE", "FFFF"],
            "flag_state": ["FR", "VE", "FR", "FR"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
                "EXTERNAL_REFERENCE_NUMBER",
                "EXTERNAL_REFERENCE_NUMBER",
            ],
            "is_at_port": [True, False, False, False],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
                datetime(2022, 4, 11, 8, 20, 11),
                datetime(2022, 4, 1, 18, 18, 12),
            ],
            "latitude": [45.23, -12.256, -12.56, 12.8],
            "longitude": [12.8, -2.961, 8.52, -5.6],
            "beacon_number": ["beacon_1", "beacon_2", "beacon_3", "beacon_4"],
            "beacon_status": [
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
            ],
        }
    )

    beacon_malfunctions = prepare_new_beacon_malfunctions.run(new_malfunctions)

    expected_beacon_malfunctions = pd.DataFrame(
        {
            "internal_reference_number": ["B", "D", "E", "F"],
            "external_reference_number": ["BB", "DD", "EE", "FF"],
            "ircs": ["BBB", "DDD", "EEE", "FFF"],
            "vessel_name": ["BBBB", "DDDD", "EEEE", "FFFF"],
            "flag_state": ["FR", "VE", "FR", "FR"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
                "EXTERNAL_REFERENCE_NUMBER",
                "EXTERNAL_REFERENCE_NUMBER",
            ],
            "vessel_status": [
                BeaconMalfunctionVesselStatus.AT_PORT.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
            ],
            "stage": [
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
            ],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
                datetime(2022, 4, 11, 8, 20, 11),
                datetime(2022, 4, 1, 18, 18, 12),
            ],
            "malfunction_end_date_utc": [pd.NaT, pd.NaT, pd.NaT, pd.NaT],
            "vessel_status_last_modification_date_utc": [
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
            "vessel_id": [2, 4, 5, 6],
            "notification_requested": [
                (
                    BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value
                ),
                (
                    BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value
                ),
                (
                    BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value
                ),
                None,
            ],
            "latitude": [45.23, -12.256, -12.56, 12.8],
            "longitude": [12.8, -2.961, 8.52, -5.6],
            "beacon_number": ["beacon_1", "beacon_2", "beacon_3", "beacon_4"],
            "beacon_status_at_malfunction_creation": [
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
            ],
        }
    )

    pd.testing.assert_frame_equal(beacon_malfunctions, expected_beacon_malfunctions)


def test_load_new_beacon_malfunctions(reset_test_data):
    initial_beacon_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions", db="monitorfish_remote"
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
            "beacon_number": ["beacon_1", "beacon_2"],
            "beacon_status_at_malfunction_creation": [
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
            ],
        }
    )

    load_new_beacon_malfunctions.run(new_beacon_malfunctions)

    loaded_beacon_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id", db="monitorfish_remote"
    )

    assert len(loaded_beacon_malfunctions) == len(initial_beacon_malfunctions) + 2
    pd.testing.assert_series_equal(
        loaded_beacon_malfunctions.external_reference_number,
        pd.Series(
            ["RO237719", "SB125334", "ZZTOPACDC", "AB123456", "LLUK", "BB", "DD"],
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
            "X-API-KEY": "backend_api_key",
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
            "X-API-KEY": "backend_api_key",
        },
    )


@pytest.mark.parametrize(
    "stage,reason",
    [
        (
            BeaconMalfunctionStage.END_OF_MALFUNCTION,
            EndOfMalfunctionReason.RESUMED_TRANSMISSION,
        ),
        (
            BeaconMalfunctionStage.END_OF_MALFUNCTION,
            EndOfMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED,
        ),
        (
            BeaconMalfunctionStage.ARCHIVED,
            EndOfMalfunctionReason.RESUMED_TRANSMISSION,
        ),
        (
            BeaconMalfunctionStage.ARCHIVED,
            EndOfMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED,
        ),
    ],
)
@patch("src.pipeline.flows.update_beacon_malfunctions.requests")
@patch(
    "src.pipeline.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_updates_stage_and_reason(
    mock_requests, stage, reason
):
    malfunction_id_to_update = 25
    update_beacon_malfunction.run(
        malfunction_id_to_update,
        new_stage=stage,
        end_of_malfunction_reason=reason,
    )
    mock_requests.put.assert_called_once_with(
        url=f"dummy/end/point/{malfunction_id_to_update}",
        json={
            "stage": stage.value,
            "endOfBeaconMalfunctionReason": reason.value,
        },
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
            "X-API-KEY": "backend_api_key",
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


def test_update_beacon_malfunctions_flow_doesnt_create_malfunctions_if_never_emitted(
    reset_test_data,
):

    initial_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions", db="monitorfish_remote"
    )
    flow.schedule = None
    with patch("src.pipeline.flows.update_beacon_malfunctions.requests"):
        state = flow.run(
            max_hours_without_emission_at_sea=6, max_hours_without_emission_at_port=24
        )

    assert state.is_successful()

    beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions", db="monitorfish_remote"
    )

    last_positions = state.result[flow.get_tasks("extract_last_positions")[0]].result
    last_emissions = state.result[
        flow.get_tasks("get_last_emissions_of_vessels_that_should_emit")[0]
    ].result
    vessels_that_should_emit = state.result[
        flow.get_tasks("extract_vessels_that_should_emit")[0]
    ].result
    new_malfunctions = state.result[flow.get_tasks("get_new_malfunctions")[0]].result

    assert len(last_positions) == 4
    assert len(vessels_that_should_emit) == 4
    assert len(last_emissions) == 4
    assert set(last_emissions.ircs) == set(vessels_that_should_emit.ircs)
    assert set(last_emissions.ircs) != set(last_positions.ircs)

    assert len(new_malfunctions) == 0
    assert len(beacons_malfunctions) == len(initial_beacons_malfunctions)


def test_update_beacon_malfunctions_flow_moves_malfunctions_to_end_of_malfunction(
    reset_test_data,
):
    beacon_malfunction_id_to_move_to_end_of_malfunction = read_query(
        "SELECT id FROM beacon_malfunctions WHERE ircs = 'OLY7853'",
        db="monitorfish_remote",
    ).iloc[0, 0]

    beacon_malfunction_id_to_archive = read_query(
        "SELECT id FROM beacon_malfunctions WHERE ircs = 'RV348407'",
        db="monitorfish_remote",
    ).iloc[0, 0]

    flow.schedule = None
    with patch(
        "src.pipeline.flows.update_beacon_malfunctions.requests"
    ) as mock_requests:
        state = flow.run(
            max_hours_without_emission_at_sea=12,
            max_hours_without_emission_at_port=24,
        )

    assert state.is_successful()
    assert (
        len(state.result[flow.get_tasks("extract_known_malfunctions")[0]].result) == 4
    )
    assert len(state.result[flow.get_tasks("get_new_malfunctions")[0]].result) == 0

    (
        ids_not_at_port_restarted_emitting,
        ids_at_port_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) = state.result[flow.get_tasks("get_ended_malfunction_ids")[0]].result

    assert (
        ids_not_at_port_restarted_emitting,
        ids_at_port_restarted_emitting,
        ids_not_required_to_emit,
        ids_unsupervised_restarted_emitting,
    ) == (
        [beacon_malfunction_id_to_move_to_end_of_malfunction],
        [],
        [beacon_malfunction_id_to_archive],
        [],
    )
    assert mock_requests.put.call_count == 2

    mock_requests.put.assert_any_call(
        url=BEACON_MALFUNCTIONS_ENDPOINT
        + f"{beacon_malfunction_id_to_move_to_end_of_malfunction}",
        json={
            "stage": "END_OF_MALFUNCTION",
            "endOfBeaconMalfunctionReason": "RESUMED_TRANSMISSION",
        },
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
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


def test_update_beacon_malfunctions_flow_inserts_new_malfunctions(reset_test_data):
    initial_beacon_malfunctions = read_query(
        (
            "SELECT * FROM beacon_malfunctions "
            "WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')"
        ),
        db="monitorfish_remote",
    )
    flow.schedule = None

    with patch("src.pipeline.flows.update_beacon_malfunctions.requests"):
        state = flow.run(
            max_hours_without_emission_at_sea=6, max_hours_without_emission_at_port=1
        )
    loaded_beacon_malfunctions = read_query(
        (
            "SELECT * FROM beacon_malfunctions "
            "WHERE stage NOT IN ('END_OF_MALFUNCTION', 'ARCHIVED')"
        ),
        db="monitorfish_remote",
    )

    assert state.is_successful()
    assert (
        len(state.result[flow.get_tasks("extract_known_malfunctions")[0]].result) == 4
    )

    new_malfunctions = state.result[flow.get_tasks("get_new_malfunctions")[0]].result
    assert len(new_malfunctions) == 1
    assert len(initial_beacon_malfunctions) == 4
    assert len(loaded_beacon_malfunctions) == 5
    assert "FQ7058" not in initial_beacon_malfunctions.ircs.values
    assert "FQ7058" in loaded_beacon_malfunctions.ircs.values

    expected_new_malfunctions_beacons_and_notifications = pd.DataFrame(
        {
            "vessel_id": [2],
            "beacon_number": ["123456"],
            "beacon_status": [
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

    state = flow.run(
        max_hours_without_emission_at_sea=6, max_hours_without_emission_at_port=1
    )

    loaded_beacon_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions",
        db="monitorfish_remote",
    )

    pd.testing.assert_frame_equal(
        initial_beacon_malfunctions, loaded_beacon_malfunctions
    )


def test_flow_does_not_create_malfunctions_for_operators_that_are_not_up(
    reset_test_data,
):
    flow.replace(
        flow.get_tasks("extract_satellite_operators_statuses")[0],
        extract_satellite_operators_statuses_mock_factory(False, None),
    )

    initial_beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions",
        db="monitorfish_remote",
    )
    flow.schedule = None

    with patch("src.pipeline.flows.update_beacon_malfunctions.requests"):
        state = flow.run(
            max_hours_without_emission_at_sea=6, max_hours_without_emission_at_port=24
        )

    assert state.is_successful()

    beacons_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions",
        db="monitorfish_remote",
    )

    new_malfunctions = state.result[flow.get_tasks("get_new_malfunctions")[0]].result

    assert len(new_malfunctions) == 0
    pd.testing.assert_frame_equal(initial_beacons_malfunctions, beacons_malfunctions)


def test_flow_fails_if_last_positions_healthcheck_fails(reset_test_data):

    flow.replace(
        flow.get_tasks("get_monitorfish_healthcheck")[0],
        get_monitorfish_healthcheck_mock_factory(
            last_position_updated_by_prefect_minutes_ago=15
        ),
    )

    flow.schedule = None
    state = flow.run()

    assert not state.is_successful()
    assert isinstance(
        state.result[flow.get_tasks("assert_last_positions_flow_health")[0]].result,
        MonitorfishHealthError,
    )
    assert isinstance(
        state.result[flow.get_tasks("load_new_beacon_malfunctions")[0]].result,
        TRIGGERFAIL,
    )
