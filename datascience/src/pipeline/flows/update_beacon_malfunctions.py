from datetime import datetime
from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
import prefect
import requests
from prefect import Flow, Parameter, task, unmapped

from config import (
    BEACON_MALFUNCTIONS_ENDPOINT,
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT,
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA,
)
from src.pipeline.entities.beacon_malfunctions import (
    BeaconMalfunctionNotificationType,
    BeaconMalfunctionStage,
    BeaconMalfunctionVesselStatus,
    EndOfMalfunctionReason,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import (
    join_on_multiple_keys,
    left_isin_right_by_decreasing_priority,
)
from src.pipeline.shared_tasks.beacons import beaconStatus
from src.pipeline.shared_tasks.dates import get_utcnow, make_timedelta
from src.pipeline.shared_tasks.healthcheck import (
    assert_last_positions_health,
    get_monitorfish_healthcheck,
)


@task(checkpoint=False)
def extract_beacons_last_emission() -> pd.DataFrame:
    """
    Extract the last emission date of each vessel in the `last_positions` table for
    certain flag states.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/beacons_last_emission.sql",
    )


@task(checkpoint=False)
def extract_known_malfunctions() -> pd.DataFrame:
    """
    Extract ongoing malfunctions in the `beacon_malfunctions` table.
    """
    return extract("monitorfish_remote", "monitorfish/known_beacon_malfunctions.sql")


@task(checkpoint=False)
def extract_vessels_with_beacon() -> pd.DataFrame:
    """
    Extract vessels from the `vessels` table that have a beacon assciated to them and
    with a flag_state that must be monitored.
    """
    return extract("monitorfish_remote", "monitorfish/vessels_with_beacon.sql")


@task(checkpoint=False)
def get_vessels_that_should_emit(vessels_with_beacon: pd.DataFrame) -> pd.DataFrame:
    """Filter the input DataFrame of vessels_with_beacon to keep only those with
    an `ACTIVATED` beacon.

    Args:
        vessels_with_beacon (pd.DataFrame): DataFrame of vessels

    Returns:
        pd.DataFrame: filtered version of input
    """
    vessels_that_should_emit = (
        vessels_with_beacon.loc[
            vessels_with_beacon.beacon_status == beaconStatus.ACTIVATED.value
        ]
        .drop(columns=["beacon_status"])
        .reset_index(drop=True)
    )
    return vessels_that_should_emit


@task(checkpoint=False)
def get_temporarily_unsupervised_vessels(
    vessels_with_beacon: pd.DataFrame,
) -> pd.DataFrame:
    """Filter the input DataFrame of vessels_with_beacon to keep only those with
    an `UNSUPERVISED` beacon.

    Args:
        vessels_with_beacon (pd.DataFrame): DataFrame of vessels

    Returns:
        pd.DataFrame: filtered version of input
    """
    temporarily_unsupervised_vessels = (
        vessels_with_beacon.loc[
            vessels_with_beacon.beacon_status == beaconStatus.UNSUPERVISED.value
        ]
        .drop(columns=["beacon_status"])
        .reset_index(drop=True)
    )
    return temporarily_unsupervised_vessels


@task(checkpoint=False)
def get_current_malfunctions(
    vessels_that_should_emit: pd.DataFrame,
    beacons_last_emission: pd.DataFrame,
    malfunction_datetime_utc_threshold_at_sea: datetime,
    malfunction_datetime_utc_threshold_at_port: datetime,
) -> pd.DataFrame:
    """Filters the input `DataFrame` of vessels that should emit and keeps only those
    which are either absent from `beacons_last_emission` or for which the
    `last_position_datetime_utc` is older than
    `malfunction_datetime_utc_threshold_at_sea` or
    `malfunction_datetime_utc_threshold_at_port`, depending on whether the last
    emission `is_at_port`.

    Args:
        beacons_last_emission (pd.DataFrame): `DataFrame` of last emissoions,
          containing at least a `last_emission_datetime_utc` datetime column and a
          `is_at_port` boolean column.
        malfunction_datetime_utc_threshold_at_sea (datetime): Oldest date after which
          vessels at sea must have emitted
        malfunction_datetime_utc_threshold_at_port (datetime): Oldest date after which
          vessels at port must have emitted

    Returns:
        pd.DataFrame: `DataFrame` of malfunctions.
    """

    last_emission_of_vessels_that_should_emit = join_on_multiple_keys(
        beacons_last_emission,
        vessels_that_should_emit,
        or_join_keys=["cfr", "ircs", "external_immatriculation"],
        how="right",
    )

    current_malfunctions = (
        last_emission_of_vessels_that_should_emit.loc[
            (last_emission_of_vessels_that_should_emit.is_manual == True)
            | (
                last_emission_of_vessels_that_should_emit.last_position_datetime_utc.isna()
            )
            | (
                (last_emission_of_vessels_that_should_emit.is_at_port == True)
                & (
                    last_emission_of_vessels_that_should_emit.last_position_datetime_utc
                    < malfunction_datetime_utc_threshold_at_port
                )
            )
            | (
                (last_emission_of_vessels_that_should_emit.is_at_port == False)
                & (
                    last_emission_of_vessels_that_should_emit.last_position_datetime_utc
                    < malfunction_datetime_utc_threshold_at_sea
                )
            )
        ]
        .rename(columns={"last_position_datetime_utc": "malfunction_start_date_utc"})
        .reset_index(drop=True)
    )

    current_malfunctions = current_malfunctions.drop(columns=["is_manual"])
    return current_malfunctions


@task(checkpoint=False)
def get_vessels_emitting(
    beacons_last_emission: pd.DataFrame,
    malfunction_datetime_utc_threshold_at_sea: datetime,
    malfunction_datetime_utc_threshold_at_port: datetime,
) -> pd.DataFrame:
    """Filters the input `DataFrame` of last emissions and keeps only those for which
    the `last_position_datetime_utc` is more recent than
    `malfunction_datetime_utc_threshold_at_sea` or
    `malfunction_datetime_utc_threshold_at_port`, depending on whether the last
    emission `is_at_port`.

    Args:
        beacons_last_emission (pd.DataFrame): `DataFrame` of last emissoions,
          containing at least a `last_emission_datetime_utc` datetime column and a
          `is_at_port` boolean column.
        malfunction_datetime_utc_threshold_at_sea (datetime): Oldest date after which
          vessels at sea must have emitted
        malfunction_datetime_utc_threshold_at_port (datetime): Oldest date after which
          vessels at port must have emitted

    Returns:
        pd.DataFrame: `DataFrame` of vessels that emitted after the relevant threshold.
    """
    vessels_emitting = beacons_last_emission.loc[
        (beacons_last_emission.is_manual == False)
        & (
            (
                beacons_last_emission.is_at_port
                & (
                    beacons_last_emission.last_position_datetime_utc
                    >= malfunction_datetime_utc_threshold_at_port
                )
            )
            | (
                (~beacons_last_emission.is_at_port)
                & (
                    beacons_last_emission.last_position_datetime_utc
                    >= malfunction_datetime_utc_threshold_at_sea
                )
            )
        )
    ].reset_index(drop=True)[["cfr", "external_immatriculation", "ircs"]]

    return vessels_emitting


@task(checkpoint=False)
def get_new_malfunctions(
    current_malfunctions: pd.DataFrame, known_malfunctions: pd.DataFrame
) -> pd.DataFrame:
    """Filters `current_malfunctions` to keep only malfunctions that are not in
    `known_malfunctions`. Both input DataFrames must have columns :

      - cfr
      - external_immatriculation
      - ircs

    Args:
        current_malfunctions (pd.DataFrame): `DataFrame` of current
          malfunctions.
        known_malfunctions (pd.DataFrame): `DataFrame` of already known
          malfunctions.

    Returns:
        pd.DataFrame: filtered version of `current_malfunctions`
    """
    vessel_id_cols = ["cfr", "ircs", "external_immatriculation"]

    return current_malfunctions.loc[
        ~left_isin_right_by_decreasing_priority(
            current_malfunctions.loc[:, vessel_id_cols],
            known_malfunctions.loc[:, vessel_id_cols],
        )
    ]


@task(checkpoint=False)
def get_ended_beacon_malfunction_ids(
    known_malfunctions: pd.DataFrame,
    vessels_emitting: pd.DataFrame,
    temporarily_unsupervised_vessels: pd.DataFrame,
    vessels_that_should_emit: pd.DataFrame,
) -> Tuple[list, list, list]:
    """Returns the ids of the `known_malfunctions` that are now ended.

    All 4 input DataFrames must have columns :

      - cfr
      - external_immatriculation
      - ircs

    `known_malfunctions` must in addition have an `id` column.

    Args:
        known_malfunctions (pd.DataFrame): `DataFrame` of malfunctions.
        vessels_emitting (pd.DataFrame): `DataFrame` of vessels now emitting.
        temporarily_unsupervised_vessels (pd.DataFrame): `DataFrame` of vessels with
          `UNSUPERVISED` beacon
        vessels_that_should_emit (pd.DataFrame): `DataFrame` of vessels with an
          `ACTIVATED` beacon

    Returns:
        Tuple[list, list, list]: 3-tuple of lists :

          - ids of `beacon_malfunctions` corresponding to vessels that are still
            required to emit and that restarted emitting. These are the ids of
            malfunctions that should be ended with reason RESUMED_TRANSMISSION
          - ids of `beacon_malfunctions` corresponding to vessels that now have an
            `UNSUPERVISED` beacon, which should be ended with reason
            TEMPORARY_INTERRUPTION_OF_SUPERVISION
          - ids of `beacon_malfunctions` corresponding to vessels that no longer have a
            beacon, or whose beacon is neither `ACTIVATED` nor `UNSUPERVISED`. These
            malfunctions are to be ended with reason
            PERMANENT_INTERRUPTION_OF_SUPERVISION
    """
    vessel_id_cols = ["cfr", "ircs", "external_immatriculation"]

    beacon_malfunctions_with_resumed_transmission = set(
        known_malfunctions.loc[
            left_isin_right_by_decreasing_priority(
                known_malfunctions.loc[:, vessel_id_cols],
                vessels_emitting.loc[:, vessel_id_cols],
            ),
            "id",
        ]
    )

    beacon_malfunctions_no_longer_required_to_emit = set(
        known_malfunctions.loc[
            ~left_isin_right_by_decreasing_priority(
                known_malfunctions.loc[:, vessel_id_cols],
                vessels_that_should_emit.loc[:, vessel_id_cols],
            ),
            "id",
        ]
    )

    beacon_malfunctions_temporarily_unsupervised = set(
        known_malfunctions.loc[
            left_isin_right_by_decreasing_priority(
                known_malfunctions.loc[:, vessel_id_cols],
                temporarily_unsupervised_vessels.loc[:, vessel_id_cols],
            ),
            "id",
        ]
    )

    beacon_malfunctions_permanently_unsupervised = (
        beacon_malfunctions_no_longer_required_to_emit
        - beacon_malfunctions_temporarily_unsupervised
    )

    beacon_malfunctions_with_resumed_transmission = (
        beacon_malfunctions_with_resumed_transmission
        - beacon_malfunctions_no_longer_required_to_emit
    )

    return (
        list(beacon_malfunctions_with_resumed_transmission),
        list(beacon_malfunctions_temporarily_unsupervised),
        list(beacon_malfunctions_permanently_unsupervised),
    )


@task(checkpoint=False)
def prepare_new_beacon_malfunctions(new_malfunctions: pd.DataFrame) -> pd.DataFrame:
    new_malfunctions = new_malfunctions.rename(
        columns={
            "cfr": "internal_reference_number",
            "external_immatriculation": "external_reference_number",
        }
    )
    new_malfunctions["vessel_status"] = np.choose(
        (
            new_malfunctions.is_at_port.where(
                new_malfunctions.is_at_port.notnull(), 2
            ).astype(int)
        ),
        [
            BeaconMalfunctionVesselStatus.AT_SEA.value,
            BeaconMalfunctionVesselStatus.AT_PORT.value,
            BeaconMalfunctionVesselStatus.NEVER_EMITTED.value,
        ],
    )

    new_malfunctions["stage"] = BeaconMalfunctionStage.INITIAL_ENCOUNTER.value

    new_malfunctions["malfunction_end_date_utc"] = pd.NaT
    new_malfunctions["malfunction_start_date_utc"] = new_malfunctions[
        "malfunction_start_date_utc"
    ].fillna(datetime.utcnow())
    new_malfunctions["vessel_status_last_modification_date_utc"] = datetime.utcnow()

    notification_to_send = {
        BeaconMalfunctionVesselStatus.AT_SEA.value: BeaconMalfunctionNotificationType.MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION.value,
        BeaconMalfunctionVesselStatus.AT_PORT.value: BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
        BeaconMalfunctionVesselStatus.NEVER_EMITTED.value: BeaconMalfunctionNotificationType.MALFUNCTION_AT_PORT_INITIAL_NOTIFICATION.value,
    }

    new_malfunctions["notification_requested"] = new_malfunctions.vessel_status.map(
        lambda x: notification_to_send[x]
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
        "priority",
        "malfunction_start_date_utc",
        "malfunction_end_date_utc",
        "vessel_status_last_modification_date_utc",
        "vessel_id",
        "notification_requested",
        "latitude",
        "longitude",
    ]
    return new_malfunctions.loc[:, ordered_columns]


@task(checkpoint=False)
def load_new_beacon_malfunctions(new_beacon_malfunctions: pd.DataFrame):
    load(
        new_beacon_malfunctions,
        table_name="beacon_malfunctions",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="append",
    )


@task(checkpoint=False)
def update_beacon_malfunction(
    beacon_malfunction_id: int,
    *,
    new_stage: BeaconMalfunctionStage = None,
    new_vessel_status: BeaconMalfunctionVesselStatus = None,
    end_of_malfunction_reason: EndOfMalfunctionReason = None,
):
    """Update a `beacon_malfunction`s stage or vessel status.

    - Exactly one of `new_state` or `new_vessel_status` must be provided
    - `end_of_malfunction_reason` must be provided if, and only if, `new_stage` is
      provided and is equal to `END_OF_MALFUNCTION`

    Args:
        beacon_malfunction_id (int): id of the beacon_malfunction to update
        new_stage (beaconMalfunctionStage, optional): stage to move the beacon
          malfunction to. Defaults to None.
        new_vessel_status (beaconMalfunctionVesselStatus, optional): vessel_status to
          move the beacon malfunction to. Defaults to None.
        end_of_malfunction_reason (endOfMalfunctionReason, optional): reason that led
          to the end of the malfunction. Defaults to None.

    Raises:
        ValueError: in the following cases :

          - `new_stage` is `END_OF_MALFUNCTION` and no `end_of_malfunction_reason` is
            provided
          - an `end_of_malfunction_reason` is provided, but `new_stage` is either not
            provided or is different from `END_OF_MALFUNCTION`
          - both `new_stage` and `new_vessel_status` are provided
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
        if new_stage is BeaconMalfunctionStage.END_OF_MALFUNCTION:
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
                        "Cannot provide an end_of_malfunction_reason "
                        "if new_stage is not END_OF_MALFUNCTION"
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
        }
        r = requests.put(url=url, json=json, headers=headers)
        r.raise_for_status()


with Flow("Beacons malfunctions") as flow:

    # Healthcheck
    healthcheck = get_monitorfish_healthcheck()
    now = get_utcnow()
    last_positions_healthcheck = assert_last_positions_health(
        healthcheck=healthcheck, utcnow=now
    )

    # Parameters
    max_hours_without_emission_at_sea = Parameter(
        "max_hours_without_emission_at_sea",
        default=BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA,
    )
    max_hours_without_emission_at_port = Parameter(
        "max_hours_without_emission_at_port",
        default=BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT,
    )

    # Extract
    beacons_last_emission = extract_beacons_last_emission(
        upstream_tasks=[last_positions_healthcheck]
    )
    vessels_with_beacon = extract_vessels_with_beacon(
        upstream_tasks=[last_positions_healthcheck]
    )
    known_malfunctions = extract_known_malfunctions(
        upstream_tasks=[last_positions_healthcheck]
    )

    # Transform
    non_emission_at_sea_max_duration = make_timedelta(
        hours=max_hours_without_emission_at_sea
    )
    non_emission_at_port_max_duration = make_timedelta(
        hours=max_hours_without_emission_at_port
    )

    malfunction_datetime_utc_threshold_at_sea = now - non_emission_at_sea_max_duration
    malfunction_datetime_utc_threshold_at_port = now - non_emission_at_port_max_duration

    vessels_that_should_emit = get_vessels_that_should_emit(vessels_with_beacon)
    temporarily_unsupervised_vessels = get_temporarily_unsupervised_vessels(
        vessels_with_beacon
    )

    current_malfunctions = get_current_malfunctions(
        vessels_that_should_emit,
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea,
        malfunction_datetime_utc_threshold_at_port,
    )

    vessels_emitting = get_vessels_emitting(
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea,
        malfunction_datetime_utc_threshold_at_port,
    )

    (
        beacon_malfunctions_with_resumed_transmission,
        beacon_malfunctions_temporarily_unsupervised,
        beacon_malfunctions_permanently_unsupervised,
    ) = get_ended_beacon_malfunction_ids(
        known_malfunctions,
        vessels_emitting,
        temporarily_unsupervised_vessels,
        vessels_that_should_emit,
    )

    new_malfunctions = get_new_malfunctions(current_malfunctions, known_malfunctions)

    new_malfunctions = prepare_new_beacon_malfunctions(new_malfunctions)

    # Load
    update_beacon_malfunction.map(
        beacon_malfunctions_with_resumed_transmission,
        new_stage=unmapped(BeaconMalfunctionStage.END_OF_MALFUNCTION),
        end_of_malfunction_reason=unmapped(EndOfMalfunctionReason.RESUMED_TRANSMISSION),
    )

    update_beacon_malfunction.map(
        beacon_malfunctions_temporarily_unsupervised,
        new_stage=unmapped(BeaconMalfunctionStage.END_OF_MALFUNCTION),
        end_of_malfunction_reason=unmapped(
            EndOfMalfunctionReason.TEMPORARY_INTERRUPTION_OF_SUPERVISION
        ),
    )

    update_beacon_malfunction.map(
        beacon_malfunctions_permanently_unsupervised,
        new_stage=unmapped(BeaconMalfunctionStage.END_OF_MALFUNCTION),
        end_of_malfunction_reason=unmapped(
            EndOfMalfunctionReason.PERMANENT_INTERRUPTION_OF_SUPERVISION
        ),
    )

    load_new_beacon_malfunctions(new_malfunctions)

flow.file_name = Path(__file__).name
