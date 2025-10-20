import pandas as pd
from prefect import flow, get_run_logger, task

from src.generic_tasks import extract, load


@task
def extract_trips_snapshot() -> pd.DataFrame:
    return extract(
        db_name="data_warehouse",
        query_filepath="data_warehouse/trips_snapshot.sql",
        dtypes={"is_last_trip": bool},
    )


@task
def load_trips_snapshot(trips: pd.DataFrame):
    logger = get_run_logger()
    breakpoint()
    load(
        df=trips,
        table_name="trips_snapshot",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


@flow(name="Trips snapshot")
def trips_flow(nb_days: int = 1):
    # Extract
    trips_snapshot = extract_trips_snapshot()

    # Load
    load_trips_snapshot(trips_snapshot)
