from datetime import datetime
from enum import Enum
from pathlib import Path

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
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import (
    join_on_multiple_keys,
    left_isin_right_by_decreasing_priority,
)
from src.pipeline.shared_tasks.dates import get_utcnow, make_timedelta


class beaconMalfunctionStage(Enum):
    INITIAL_ENCOUNTER = "INITIAL_ENCOUNTER"
    FOUR_HOUR_REPORT = "FOUR_HOUR_REPORT"
    RELAUNCH_REQUEST = "RELAUNCH_REQUEST"
    TARGETING_VESSEL = "TARGETING_VESSEL"
    CROSS_CHECK = "CROSS_CHECK"
    END_OF_MALFUNCTION = "END_OF_MALFUNCTION"
    ARCHIVED = "ARCHIVED"


class beaconMalfunctionVesselStatus(Enum):
    AT_SEA = "AT_SEA"
    AT_PORT = "AT_PORT"
    NEVER_EMITTED = "NEVER_EMITTED"
    NO_NEWS = "NO_NEWS"
    ACTIVITY_DETECTED = "ACTIVITY_DETECTED"


class endOfMalfunctionReason(Enum):
    RESUMED_TRANSMISSION = "RESUMED_TRANSMISSION"
    TEMPORARY_INTERRUPTION_OF_SUPERVISION = "TEMPORARY_INTERRUPTION_OF_SUPERVISION"
    PERMANENT_INTERRUPTION_OF_SUPERVISION = "PERMANENT_INTERRUPTION_OF_SUPERVISION"


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
def extract_vessels_that_should_emit() -> pd.DataFrame:
    """
    Extract vessels should must emit from the `vessels` table, i.e. vessels with an
    active beacon and with a flag_state that must be monitored.
    """
    return extract("monitorfish_remote", "monitorfish/vessels_that_should_emit.sql")


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
        on=["cfr", "ircs", "external_immatriculation"],
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
def get_beacon_malfunctions_with_resumed_transmission(
    known_malfunctions: pd.DataFrame, vessels_emitting: pd.DataFrame
) -> list:
    """Returns the ids of the `known_malfunctions` that correspond to vessels that now
    emit (those in `vessels_emitting`). Both input DataFrames must have columns :

      - cfr
      - external_immatriculation
      - ircs

    `known_malfunctions` must in addition have an `id` column.

    Args:
        known_malfunctions (pd.DataFrame): `DataFrame` of malfunctions.
        vessels_emitting (pd.DataFrame): `DataFrame` of vessels now emitting.

    Returns:
        list: ids of `beacon_malfunctions` corresponding to vessels that now emit.
    """
    vessel_id_cols = ["cfr", "ircs", "external_immatriculation"]

    beacon_malfunctions_with_resumed_transmission = list(
        set(
            known_malfunctions.loc[
                left_isin_right_by_decreasing_priority(
                    known_malfunctions.loc[:, vessel_id_cols],
                    vessels_emitting.loc[:, vessel_id_cols],
                ),
                "id",
            ]
        )
    )

    return beacon_malfunctions_with_resumed_transmission


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
            beaconMalfunctionVesselStatus.AT_SEA.value,
            beaconMalfunctionVesselStatus.AT_PORT.value,
            beaconMalfunctionVesselStatus.NEVER_EMITTED.value,
        ],
    )

    new_malfunctions["stage"] = beaconMalfunctionStage.INITIAL_ENCOUNTER.value

    new_malfunctions["malfunction_end_date_utc"] = pd.NaT
    new_malfunctions["malfunction_start_date_utc"] = new_malfunctions[
        "malfunction_start_date_utc"
    ].fillna(datetime.utcnow())
    new_malfunctions["vessel_status_last_modification_date_utc"] = datetime.utcnow()

    ordered_columns = [
        "internal_reference_number",
        "external_reference_number",
        "ircs",
        "vessel_name",
        "vessel_identifier",
        "vessel_status",
        "stage",
        "priority",
        "malfunction_start_date_utc",
        "malfunction_end_date_utc",
        "vessel_status_last_modification_date_utc",
    ]
    return new_malfunctions.loc[:, ordered_columns]


@task(checkpoint=False)
def load_new_beacons_malfunctions(new_beacons_malfunctions: pd.DataFrame):
    load(
        new_beacons_malfunctions,
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
    new_stage: beaconMalfunctionStage = None,
    new_vessel_status: beaconMalfunctionVesselStatus = None,
):
    """
    Change the stage of the `beacon_malfunction`of id `beacon_malfunction_id` to `new_stage`.

    Args:
        beacon_malfunction_id (int): id of the beacon_malfunction to update
        new_stage (beaconMalfunctionStage): stage to move the beacon malfunction to
    """
    url = BEACON_MALFUNCTIONS_ENDPOINT + str(beacon_malfunction_id)

    json = {}
    if new_stage:
        json["stage"] = new_stage.value
    if new_vessel_status:
        json["vesselStatus"] = new_vessel_status.value

    if json:
        headers = {
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json;charset=UTF-8",
        }
        r = requests.put(url=url, json=json, headers=headers)
        r.raise_for_status()


with Flow("Beacons malfunctions") as flow:

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
    beacons_last_emission = extract_beacons_last_emission()
    vessels_that_should_emit = extract_vessels_that_should_emit()
    known_beacons_malfunctions = extract_known_malfunctions()

    # Transform
    now = get_utcnow()

    non_emission_at_sea_max_duration = make_timedelta(
        hours=max_hours_without_emission_at_sea
    )
    non_emission_at_port_max_duration = make_timedelta(
        hours=max_hours_without_emission_at_port
    )

    malfunction_datetime_utc_threshold_at_sea = now - non_emission_at_sea_max_duration
    malfunction_datetime_utc_threshold_at_port = now - non_emission_at_port_max_duration

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

    beacon_malfunctions_with_resumed_transmission = (
        get_beacon_malfunctions_with_resumed_transmission(
            known_beacons_malfunctions, vessels_emitting
        )
    )

    new_malfunctions = get_new_malfunctions(
        current_malfunctions, known_beacons_malfunctions
    )

    new_malfunctions = prepare_new_beacon_malfunctions(new_malfunctions)

    # Load
    update_beacon_malfunction.map(
        beacon_malfunctions_with_resumed_transmission,
        new_stage=unmapped(beaconMalfunctionStage.END_OF_MALFUNCTION),
    )
    load_new_beacons_malfunctions(new_malfunctions)

flow.file_name = Path(__file__).name
