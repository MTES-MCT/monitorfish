from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd
import requests
from prefect import get_run_logger, task

from config import BACKEND_API_KEY, BEACON_MALFUNCTIONS_ENDPOINT
from src.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionStage,
    BeaconMalfunctionVesselStatus,
    BeaconStatus,
    EndOfMalfunctionReason,
)
from src.generic_tasks import load


@task
def prepare_new_beacon_malfunctions(new_malfunctions: pd.DataFrame) -> pd.DataFrame:
    new_malfunctions["vessel_status"] = np.choose(
        new_malfunctions.is_at_port.astype(int),
        [
            BeaconMalfunctionVesselStatus.AT_SEA.value,
            BeaconMalfunctionVesselStatus.AT_PORT.value,
        ],
    )

    new_malfunctions["initial_vessel_status"] = np.choose(
        new_malfunctions.is_at_port.astype(int),
        [
            BeaconMalfunctionVesselStatus.AT_SEA.value,
            BeaconMalfunctionVesselStatus.AT_PORT.value,
        ],
    )

    new_malfunctions["is_followed"] = np.choose(
        new_malfunctions.is_at_port.astype(int),
        [
            True,
            False,
        ],
    )

    now = datetime.utcnow()
    new_malfunctions["creation_datetime_utc"] = now

    new_malfunctions["stage"] = BeaconMalfunctionStage.INITIAL_ENCOUNTER.value

    new_malfunctions["malfunction_end_date_utc"] = pd.NaT
    new_malfunctions["vessel_status_last_modification_date_utc"] = now

    notification_to_send = {
        (BeaconMalfunctionVesselStatus.AT_SEA.value, BeaconStatus.ACTIVATED.value): (
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value
        ),
        (BeaconMalfunctionVesselStatus.AT_PORT.value, BeaconStatus.ACTIVATED.value): (
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value
        ),
        (BeaconMalfunctionVesselStatus.AT_SEA.value, BeaconStatus.UNSUPERVISED.value): (
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON.value
        ),
        (
            BeaconMalfunctionVesselStatus.AT_PORT.value,
            BeaconStatus.UNSUPERVISED.value,
        ): (
            BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION_UNSUPERVISED_BEACON.value
        ),
    }

    new_malfunctions["notification_requested"] = (
        new_malfunctions[["vessel_status", "beacon_status"]]
        .apply(lambda row: tuple(row), axis=1)
        .map(notification_to_send)
    )
    new_malfunctions = new_malfunctions.rename(
        columns={
            "cfr": "internal_reference_number",
            "external_immatriculation": "external_reference_number",
            "beacon_status": "beacon_status_at_malfunction_creation",
        }
    )

    ordered_columns = [
        "internal_reference_number",
        "external_reference_number",
        "ircs",
        "vessel_name",
        "flag_state",
        "vessel_identifier",
        "vessel_status",
        "stage",
        "malfunction_start_date_utc",
        "malfunction_end_date_utc",
        "vessel_status_last_modification_date_utc",
        "vessel_id",
        "notification_requested",
        "latitude",
        "longitude",
        "beacon_number",
        "beacon_status_at_malfunction_creation",
        "initial_vessel_status",
        "is_followed",
        "creation_datetime_utc",
    ]
    return new_malfunctions.loc[:, ordered_columns]


@task
def load_new_beacon_malfunctions(new_beacon_malfunctions: pd.DataFrame):
    load(
        new_beacon_malfunctions,
        table_name="beacon_malfunctions",
        schema="public",
        db_name="monitorfish_remote",
        logger=get_run_logger(),
        how="append",
    )


@task
def update_beacon_malfunction(
    beacon_malfunction_id: int,
    *,
    new_stage: Optional[BeaconMalfunctionStage] = None,
    new_vessel_status: Optional[BeaconMalfunctionVesselStatus] = None,
    end_of_malfunction_reason: Optional[EndOfMalfunctionReason] = None,
):
    """Update a `beacon_malfunction` stage or vessel status.

    - Exactly one of `new_state` or `new_vessel_status` must be provided
    - `end_of_malfunction_reason` must be provided if `new_stage` is provided and is
      equal to `ARCHIVED`
    - `end_of_malfunction_reason` cannot be be provided when `new_stage` is provided
       and is different from `ARCHIVED`
    - `end_of_malfunction_reason` cannot be be provided when `new_vessel_status` is
      provided

    Args:
        beacon_malfunction_id (int): id of the beacon_malfunction to update
        new_stage (beaconMalfunctionStage, optional): stage to move the beacon
          malfunction to. Defaults to None.
        new_vessel_status (beaconMalfunctionVesselStatus, optional): vessel_status to
          move the beacon malfunction to. Defaults to None.
        end_of_malfunction_reason (endOfMalfunctionReason, optional): reason that led
          to the archiving of the malfunction. Defaults to None.

    Raises:
        ValueError: in the following cases :

          - both `new_stage` and `new_vessel_status` are provided
          - both `new_stage` and `new_vessel_status` are null
          - `new_stage` is `ARCHIVED` and no `end_of_malfunction_reason` is
            provided
          - an `end_of_malfunction_reason` is provided along with a `new_vessel_status`
          - an `end_of_malfunction_reason` is provided along with a `new_stage` other
            than `ARCHIVED`
    """

    try:
        assert (
            new_stage is None
            and isinstance(new_vessel_status, BeaconMalfunctionVesselStatus)
        ) or (
            new_vessel_status is None and isinstance(new_stage, BeaconMalfunctionStage)
        )
    except AssertionError:
        raise ValueError(
            "Exactly one of new_stage or new_vessel_status must be provided"
        )

    url = BEACON_MALFUNCTIONS_ENDPOINT + str(beacon_malfunction_id)
    json = {}

    if new_stage:
        json["stage"] = new_stage.value

        if new_stage is BeaconMalfunctionStage.ARCHIVED:
            try:
                assert isinstance(end_of_malfunction_reason, EndOfMalfunctionReason)
            except AssertionError:
                raise ValueError(
                    (
                        "Cannot end a malfunction without "
                        "giving an end_of_malfunction_reason"
                    )
                )
            json["endOfBeaconMalfunctionReason"] = end_of_malfunction_reason.value

        else:
            try:
                assert end_of_malfunction_reason is None
            except AssertionError:
                raise ValueError(
                    (
                        "Cannot give a `EndOfBeaconMalfunctionReason` for a new_stage "
                        "other than `ARCHIVED`."
                    )
                )

    if new_vessel_status:
        try:
            assert end_of_malfunction_reason is None
        except AssertionError:
            raise ValueError(
                (
                    "Unexpected argument end_of_malfunction_reason "
                    "when updating vessel_status"
                )
            )
        json["vesselStatus"] = new_vessel_status.value

    if json:
        headers = {
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
            "X-API-KEY": BACKEND_API_KEY,
        }
        r = requests.put(url=url, json=json, headers=headers)
        r.raise_for_status()

    return beacon_malfunction_id


@task
def update_beacon_malfunction_is_followed(
    beacon_malfunction_id: int,
    *,
    is_followed: bool,
):
    url = BEACON_MALFUNCTIONS_ENDPOINT + str(beacon_malfunction_id)
    headers = {
        "Accept": "application/json, text/plain",
        "Content-Type": "application/json;charset=UTF-8",
        "X-API-KEY": BACKEND_API_KEY,
    }
    r = requests.patch(url=url, json={"isFollowed": is_followed}, headers=headers)
    r.raise_for_status()
    return beacon_malfunction_id


@task
def request_notification(
    beacon_malfunction_id: int,
    requested_notification: BeaconMalfunctionNotificationType,
):
    try:
        assert isinstance(requested_notification, BeaconMalfunctionNotificationType)
    except AssertionError:
        raise ValueError(
            (
                "Expected BeaconMalfunctionNotificationType, "
                f"got {requested_notification} instead."
            )
        )

    url = (
        BEACON_MALFUNCTIONS_ENDPOINT
        + f"{str(beacon_malfunction_id)}/{requested_notification.value}"
    )
    headers = {"X-API-KEY": BACKEND_API_KEY}
    r = requests.put(url=url, headers=headers)
    r.raise_for_status()
