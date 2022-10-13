from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task

from src.pipeline.entities.beacon_malfunctions import BeaconStatus
from src.pipeline.generic_tasks import extract, load


@task(checkpoint=False)
def extract_beacons() -> pd.DataFrame:
    """
    Extract beacon numbers of all vessels from Poseidon.
    """
    return extract("fmc", "fmc/beacons.sql")


@task(checkpoint=False)
def extract_satellite_operators():
    return extract("fmc", "fmc/satellite_operators.sql")


@task(checkpoint=False)
def transform_beacons(beacons: pd.DataFrame) -> pd.DataFrame:
    """Maps Posedion beacon status to Monitorfish `BeaconStatus`.

    Args:
        beacons (pd.DataFrame): DataFrame of beacons extracted from Poseidon

    Returns:
        pd.DataFrame: beacons with status mapped to `BeaconStatus`
    """
    beacons = beacons.copy(deep=True)
    beacons["beacon_status"] = beacons.beacon_status.map(
        BeaconStatus.from_poseidon_status, na_action="ignore"
    ).map(lambda beacon_status: beacon_status.value, na_action="ignore")
    return beacons


@task(checkpoint=False)
def transform_satellite_operators(satellite_operators: pd.DataFrame) -> pd.DataFrame:
    satellite_operators = satellite_operators.copy(deep=True)
    satellite_operators["emails"] = satellite_operators.emails.map(
        lambda s: s.split(", "), na_action="ignore"
    )
    return satellite_operators


@task(checkpoint=False)
def load_beacons(beacons):

    load(
        beacons,
        table_name="beacons",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        nullable_integer_columns=["satellite_operator_id"],
    )


@task(checkpoint=False)
def load_satellite_operators(satellite_operators):
    load(
        satellite_operators,
        table_name="satellite_operators",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        pg_array_columns=["emails"],
    )


with Flow("Beacons") as flow:
    # Extract
    beacons = extract_beacons()
    satellite_operators = extract_satellite_operators()

    # Transform
    beacons = transform_beacons(beacons)
    satellite_operators = transform_satellite_operators(satellite_operators)

    # Load
    load_satellite_operators(satellite_operators)
    load_beacons(beacons)

flow.file_name = Path(__file__).name
