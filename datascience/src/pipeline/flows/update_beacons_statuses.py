from datetime import datetime
from enum import Enum

import numpy as np
import pandas as pd
import prefect
import requests
from prefect import Flow, Parameter, task, unmapped

from config import (
    BEACON_STATUSES_ENDPOINT,
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_PORT,
    BEACONS_MAX_HOURS_WITHOUT_EMISSION_AT_SEA,
)
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import left_isin_right_by_decreasing_priority
from src.pipeline.shared_tasks.dates import get_utcnow, make_timedelta


class beaconStatusStage(Enum):
    INITIAL_ENCOUNTER = "INITIAL_ENCOUNTER"
    FOUR_HOUR_REPORT = "FOUR_HOUR_REPORT"
    RELAUNCH_REQUEST = "RELAUNCH_REQUEST"
    TARGETING_VESSEL = "TARGETING_VESSEL"
    CROSS_CHECK = "CROSS_CHECK"
    RESUMED_TRANSMISSION = "RESUMED_TRANSMISSION"


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
    Extract ongoing malfunctions in the `beacon_statuses` table.
    """
    return extract("monitorfish_remote", "monitorfish/known_beacons_malfunctions.sql")


@task(checkpoint=False)
def get_current_malfunctions(
    beacons_last_emission: pd.DataFrame,
    malfunction_datetime_utc_threshold_at_sea: datetime,
    malfunction_datetime_utc_threshold_at_port: datetime,
) -> pd.DataFrame:
    """Filters the input `DataFrame` of last emissions and keeps only those for which
    the `last_position_datetime_utc` is older than
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
    current_malfunctions = (
        beacons_last_emission.loc[
            (
                beacons_last_emission.is_at_port
                & (
                    beacons_last_emission.last_position_datetime_utc
                    < malfunction_datetime_utc_threshold_at_port
                )
            )
            | (
                (~beacons_last_emission.is_at_port)
                & (
                    beacons_last_emission.last_position_datetime_utc
                    < malfunction_datetime_utc_threshold_at_sea
                )
            )
        ]
        .rename(columns={"last_position_datetime_utc": "malfunction_start_date_utc"})
        .reset_index(drop=True)
    )

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
def get_beacons_statuses_with_resumed_transmission(
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
        list: ids of `beacon_statuses` corresponding to vessels that now emit.
    """
    vessel_id_cols = ["cfr", "ircs", "external_immatriculation"]

    beacons_statuses_with_resumed_transmission = list(
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

    return beacons_statuses_with_resumed_transmission


@task(checkpoint=False)
def prepare_new_beacons_statuses(new_malfunctions: pd.DataFrame) -> pd.DataFrame:
    new_malfunctions = new_malfunctions.rename(
        columns={
            "cfr": "internal_reference_number",
            "external_immatriculation": "external_reference_number",
        }
    )
    new_malfunctions["vessel_status"] = np.choose(
        new_malfunctions.is_at_port.values, ["AT_SEA", "AT_PORT"]
    )

    new_malfunctions["stage"] = beaconStatusStage.INITIAL_ENCOUNTER.value

    new_malfunctions["malfunction_end_date_utc"] = pd.NaT
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
def load_new_beacons_statuses(new_beacons_statuses: pd.DataFrame):
    load(
        new_beacons_statuses,
        table_name="beacon_statuses",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="append",
    )


@task(checkpoint=False)
def change_beacon_status_stage(beacon_status_id: int, new_stage: beaconStatusStage):
    """
    Change the stage of the `beacon_status`of id `beacon_status_id` to `new_stage`.

    Args:
        beacon_status_id (int): id of the beacon_status to update
        new_stage (beaconStatusStage): stage to move the beacon status to
    """
    url = BEACON_STATUSES_ENDPOINT + str(beacon_status_id)
    json = {"stage": new_stage.value}
    headers = {
        "Accept": "application/json, text/plain",
        "Content-Type": "application/json;charset=UTF-8",
    }
    r = requests.put(url=url, json=json, headers=headers)
    r.raise_for_status()


with Flow("Beacons statuses") as flow:

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
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea,
        malfunction_datetime_utc_threshold_at_port,
    )

    vessels_emitting = get_vessels_emitting(
        beacons_last_emission,
        malfunction_datetime_utc_threshold_at_sea,
        malfunction_datetime_utc_threshold_at_port,
    )

    beacons_statuses_with_resumed_transmission = (
        get_beacons_statuses_with_resumed_transmission(
            known_beacons_malfunctions, vessels_emitting
        )
    )

    new_malfunctions = get_new_malfunctions(
        current_malfunctions, known_beacons_malfunctions
    )

    new_beacons_statuses = prepare_new_beacons_statuses(new_malfunctions)

    # Load
    change_beacon_status_stage.map(
        beacons_statuses_with_resumed_transmission,
        new_stage=unmapped(beaconStatusStage.RESUMED_TRANSMISSION),
    )
    load_new_beacons_statuses(new_beacons_statuses)
