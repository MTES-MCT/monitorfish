import pandas as pd
from prefect import flow, get_run_logger, task

from src.generic_tasks import extract, load


@task
def extract_facade_areas() -> pd.DataFrame:
    """
    Extract facade areas from the monitorfish_local database as a DataFrame.

    Returns:
        pd.DataFrame: GeoDataFrame of facade areas
    """

    return extract(db_name="monitorfish_local", query_filepath="cross/facade_areas.sql")


@task
def load_facade_areas(facade_areas: pd.DataFrame):
    logger = get_run_logger()

    load(
        facade_areas,
        table_name="facade_areas_subdivided",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
        replace_with_truncate=True,
    )


@flow(name="Monitorfish - Facade areas")
def facade_areas_flow():
    facade_areas = extract_facade_areas()
    load_facade_areas(facade_areas)
