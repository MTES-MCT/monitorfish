from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract, load


@task(checkpoint=False)
def extract_facade_areas() -> pd.DataFrame:
    """
    Extract facade areas from the monitorfish_local database as a DataFrame.

    Returns:
        pd.DataFrame: GeoDataFrame of facade areas
    """

    return extract(db_name="monitorfish_local", query_filepath="cross/facade_areas.sql")


@task(checkpoint=False)
def load_facade_areas(facade_areas: pd.DataFrame):
    logger = prefect.context.get("logger")

    load(
        facade_areas,
        table_name="facade_areas_subdivided",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
        replace_with_truncate=True,
    )


with Flow("Facade areas", executor=LocalDaskExecutor()) as flow:
    facade_areas = extract_facade_areas()
    load_facade_areas(facade_areas)

flow.file_name = Path(__file__).name
