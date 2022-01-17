from datetime import datetime

import numpy as np
import pandas as pd
import prefect
from prefect import Flow, Parameter, task

from config import BEACONS_MALFUNCTION_MINIMUM_DURATION_IN_HOURS
from src.pipeline.generic_tasks import extract, load
from src.pipeline.processing import left_isin_right_by_decreasing_priority


@task(checkpoint=False)
def compute_current_malfunctions(min_duration: int) -> pd.DataFrame:
    """
    Extract French vessels that have stopped emitting for at least `min_duration`
    hours in the `last_positions` table.
    """
    return extract(
        "monitorfish_remote",
        "monitorfish/current_beacons_malfunctions.sql",
        params={"hours": min_duration},
    )


@task(checkpoint=False)
def extract_known_malfunctions() -> pd.DataFrame:
    """
    Extract beacons statuses that are not.
    """
    return extract("monitorfish_remote", "monitorfish/known_beacons_malfunctions.sql")


@task(checkpoint=False)
def get_new_malfunctions(
    current_malfunctions: pd.DataFrame, known_malfunctions: pd.DataFrame
) -> pd.DataFrame:
    """Filters `current_malfunctions` to keep only malfunctions that are not in
    `known_malfunctions`. Both input DataFrames must have columns :

      - cfr
      - external_immatriculation
      - ircsmalfunction_end_date_utc

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

    new_malfunctions["stage"] = "INITIAL_ENCOUNTER"

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


with Flow("Beacons statuses") as flow:
    min_duration = Parameter(
        "min_duration", default=BEACONS_MALFUNCTION_MINIMUM_DURATION_IN_HOURS
    )
    current_beacons_malfunctions = compute_current_malfunctions(
        min_duration=min_duration
    )
    known_beacons_malfunctions = extract_known_malfunctions()

    new_malfunctions = get_new_malfunctions(
        current_beacons_malfunctions, known_beacons_malfunctions
    )

    new_beacons_statuses = prepare_new_beacons_statuses(new_malfunctions)

    load_new_beacons_statuses(new_beacons_statuses)
