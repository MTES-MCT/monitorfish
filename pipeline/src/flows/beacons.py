import pandas as pd
from prefect import flow, get_run_logger, task

from src.generic_tasks import extract, load
from src.processing import zeros_ones_to_bools


@task
def extract_beacons() -> pd.DataFrame:
    """
    Extract beacon numbers of all vessels from Poseidon.
    """
    return extract("fmc", "fmc/beacons.sql", parse_dates=["logging_datetime_utc"])


@task
def extract_satellite_operators():
    return extract("fmc", "fmc/satellite_operators.sql")


@task
def transform_beacons(beacons: pd.DataFrame) -> pd.DataFrame:
    """Maps the 1, 0 and `np.nan` values in `is_coastal` to `True`, `False` and `None`
    respectively.

    Args:
        beacons (pd.DataFrame): DataFrame of beacons extracted from Poseidon

    Returns:
        pd.DataFrame: beacons with `is_coastal` mapped to `True`, `False` and `None`.
    """
    beacons = beacons.copy(deep=True)
    beacons["is_coastal"] = zeros_ones_to_bools(beacons.is_coastal)
    return beacons


@task
def transform_satellite_operators(satellite_operators: pd.DataFrame) -> pd.DataFrame:
    satellite_operators = satellite_operators.copy(deep=True)
    satellite_operators["emails"] = satellite_operators.emails.map(
        lambda s: s.split(", "), na_action="ignore"
    )
    return satellite_operators


@task
def load_beacons(beacons):
    load(
        beacons,
        table_name="beacons",
        schema="public",
        db_name="monitorfish_remote",
        logger=get_run_logger(),
        how="replace",
        nullable_integer_columns=["satellite_operator_id", "vessel_id"],
    )


@task
def load_satellite_operators(satellite_operators):
    load(
        satellite_operators,
        table_name="satellite_operators",
        schema="public",
        db_name="monitorfish_remote",
        logger=get_run_logger(),
        how="replace",
        pg_array_columns=["emails"],
    )


@flow(name="Monitorfish - Beacons")
def beacons_flow():
    # Extract
    beacons = extract_beacons()
    satellite_operators = extract_satellite_operators()

    # Transform
    beacons = transform_beacons(beacons)
    satellite_operators = transform_satellite_operators(satellite_operators)

    # Load
    load_satellite_operators(satellite_operators)
    load_beacons(beacons)
