from datetime import datetime
from unittest.mock import patch

import pandas as pd
import pytest

from src.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionStage,
    BeaconMalfunctionVesselStatus,
    BeaconStatus,
    EndOfMalfunctionReason,
)
from src.read_query import read_query
from src.shared_tasks.beacon_malfunctions import (
    load_new_beacon_malfunctions,
    prepare_new_beacon_malfunctions,
    update_beacon_malfunction,
    update_beacon_malfunction_is_followed,
)
from tests.mocks import mock_datetime_utcnow


@patch("src.flows.update_beacon_malfunctions.requests")
@patch(
    "src.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_raises_when_both_stage_and_status_are_supplied(
    mock_requests,
):
    malfunction_id_to_update = 25
    with pytest.raises(ValueError):
        update_beacon_malfunction(
            malfunction_id_to_update,
            new_stage=BeaconMalfunctionStage.FOUR_HOUR_REPORT,
            new_vessel_status=BeaconMalfunctionVesselStatus.AT_SEA,
        )


@patch("src.flows.update_beacon_malfunctions.requests")
@patch(
    "src.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_raises_when_reason_is_missing(mock_requests):
    malfunction_id_to_update = 25
    with pytest.raises(ValueError):
        update_beacon_malfunction(
            malfunction_id_to_update,
            new_stage=BeaconMalfunctionStage.ARCHIVED,
        )


@patch("src.flows.update_beacon_malfunctions.requests")
@patch(
    "src.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_updates_status(mock_requests):
    malfunction_id_to_update = 25
    update_beacon_malfunction(
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


@patch("src.flows.update_beacon_malfunctions.requests")
@patch(
    "src.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_updates_stage(mock_requests):
    malfunction_id_to_update = 25
    update_beacon_malfunction(
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
    "reason",
    [
        EndOfMalfunctionReason.RESUMED_TRANSMISSION,
        EndOfMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED,
    ],
)
@patch("src.flows.update_beacon_malfunctions.requests")
@patch(
    "src.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_updates_stage_and_reason(mock_requests, reason):
    malfunction_id_to_update = 25
    update_beacon_malfunction(
        malfunction_id_to_update,
        new_stage=BeaconMalfunctionStage.ARCHIVED,
        end_of_malfunction_reason=reason,
    )
    mock_requests.put.assert_called_once_with(
        url=f"dummy/end/point/{malfunction_id_to_update}",
        json={
            "stage": BeaconMalfunctionStage.ARCHIVED.value,
            "endOfBeaconMalfunctionReason": reason.value,
        },
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
            "X-API-KEY": "backend_api_key",
        },
    )


@patch("src.flows.update_beacon_malfunctions.requests")
@patch(
    "src.flows.update_beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_raises_if_no_stage_and_no_status(mock_requests):
    malfunction_id_to_update = 25
    with pytest.raises(ValueError):
        update_beacon_malfunction(
            malfunction_id_to_update,
            new_stage=None,
            new_vessel_status=None,
        )


@patch(
    "src.flows.update_beacon_malfunctions.datetime",
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

    beacon_malfunctions = prepare_new_beacon_malfunctions(new_malfunctions)

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
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON.value,
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
            "initial_vessel_status": [
                "AT_PORT",
                "AT_SEA",
                "AT_SEA",
                "AT_SEA",
            ],
            "is_followed": [
                False,
                True,
                True,
                True,
            ],
            "creation_datetime_utc": [
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
        }
    ).astype(
        {
            "vessel_status_last_modification_date_utc": "datetime64[us]",
            "creation_datetime_utc": "datetime64[us]",
        }
    )

    pd.testing.assert_frame_equal(beacon_malfunctions, expected_beacon_malfunctions)


def test_load_new_beacon_malfunctions(reset_test_data):
    initial_beacon_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions", db="monitorfish_remote"
    )

    new_beacon_malfunctions = pd.DataFrame(
        {
            "internal_reference_number": ["B", "D", "E", "F", "G", "H", "I", "J"],
            "external_reference_number": [
                "BB",
                "DD",
                "EE",
                "FF",
                "GG",
                "HH",
                "II",
                "JJ",
            ],
            "ircs": ["BBB", "DDD", "EEE", "FFF", "GGG", "HHH", "III", "JJJ"],
            "vessel_name": [
                "BBBB",
                "DDDD",
                "EEEE",
                "FFFF",
                "GGGG",
                "HHHH",
                "IIII",
                "JJJJ",
            ],
            "flag_state": ["FR", "VE", "FR", "FR", "FR", "FR", "FR", "FR"],
            "vessel_identifier": [
                "INTERNAL_REFERENCE_NUMBER",
                "IRCS",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
                "INTERNAL_REFERENCE_NUMBER",
            ],
            "vessel_status": [
                BeaconMalfunctionVesselStatus.AT_PORT.value,
                BeaconMalfunctionVesselStatus.AT_SEA.value,
                BeaconMalfunctionVesselStatus.NO_NEWS.value,
                BeaconMalfunctionVesselStatus.ACTIVITY_DETECTED.value,
                BeaconMalfunctionVesselStatus.TECHNICAL_STOP.value,
                BeaconMalfunctionVesselStatus.ON_SALE.value,
                BeaconMalfunctionVesselStatus.SUSPENDED_BECAUSE_UNPAID.value,
                BeaconMalfunctionVesselStatus.IN_FOREIGN_EEZ.value,
            ],
            "stage": [
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
                BeaconMalfunctionStage.INITIAL_ENCOUNTER.value,
            ],
            "malfunction_start_date_utc": [
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
                datetime(2020, 3, 30, 12, 0, 0),
                datetime(2022, 4, 1, 18, 20, 12),
            ],
            "malfunction_end_date_utc": [
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
            ],
            "vessel_status_last_modification_date_utc": [
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
            "vessel_id": [2, 4, 50, 51, 52, 53, 54, 55],
            "notification_requested": [
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON.value,
                BeaconMalfunctionNotificationType.END_OF_MALFUNCTION.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_REMINDER.value,
                BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_REMINDER.value,
            ],
            "latitude": [
                45.23,
                -12.256,
                45.23,
                -12.256,
                45.23,
                -12.256,
                45.23,
                -12.256,
            ],
            "longitude": [12.8, -2.961, 12.8, -2.961, 12.8, -2.961, 12.8, -2.961],
            "beacon_number": [
                "beacon_1",
                "beacon_2",
                "beacon_3",
                "beacon_4",
                "beacon_5",
                "beacon_6",
                "beacon_7",
                "beacon_8",
            ],
            "beacon_status_at_malfunction_creation": [
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
                BeaconStatus.IN_TEST.value,
                BeaconStatus.NON_APPROVED.value,
                BeaconStatus.DEACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
                BeaconStatus.ACTIVATED.value,
                BeaconStatus.UNSUPERVISED.value,
            ],
            "initial_vessel_status": [
                "AT_PORT",
                "AT_SEA",
                "AT_SEA",
                "AT_SEA",
                "AT_PORT",
                "AT_SEA",
                "AT_SEA",
                "AT_SEA",
            ],
            "is_followed": [
                False,
                True,
                True,
                True,
                False,
                True,
                True,
                True,
            ],
            "creation_datetime_utc": [
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
                datetime(2021, 1, 1, 1, 1, 1),
            ],
        }
    )

    load_new_beacon_malfunctions(new_beacon_malfunctions)

    loaded_beacon_malfunctions = read_query(
        "SELECT * FROM beacon_malfunctions ORDER BY id", db="monitorfish_remote"
    )

    assert len(loaded_beacon_malfunctions) == len(initial_beacon_malfunctions) + 8
    pd.testing.assert_series_equal(
        loaded_beacon_malfunctions.external_reference_number,
        pd.Series(
            [
                "RO237719",
                "SB125334",
                "ZZTOPACDC",
                "AB123456",
                "LLUK",
                "BB",
                "DD",
                "EE",
                "FF",
                "GG",
                "HH",
                "II",
                "JJ",
            ],
            name="external_reference_number",
        ),
    )


@pytest.mark.parametrize("is_followed", [False, True])
@patch("src.shared_tasks.beacon_malfunctions.requests")
@patch(
    "src.shared_tasks.beacon_malfunctions.BEACON_MALFUNCTIONS_ENDPOINT",
    "dummy/end/point/",
)
def test_update_beacon_malfunction_is_followed(mock_requests, is_followed):
    update_beacon_malfunction_is_followed(25, is_followed=is_followed)
    mock_requests.patch.assert_called_once_with(
        url="dummy/end/point/25",
        json={"isFollowed": is_followed},
        headers={
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
            "X-API-KEY": "backend_api_key",
        },
    )
