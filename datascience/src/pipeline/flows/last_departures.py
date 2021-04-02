import pandas as pd
import prefect
from prefect import Flow, task

from src.db_config import create_engine
from src.pipeline.generic_tasks import delete_then_insert
from src.read_query import read_saved_query


@task(checkpoint=False)
def extract_last_departures() -> pd.DataFrame:
    return read_saved_query(
        "monitorfish_remote", "pipeline/queries/monitorfish/last_departures.sql"
    )


@task(checkpoint=False)
def load_last_departure(last_departures: pd.DataFrame) -> None:
    delete_then_insert(
        last_departures,
        table_name="last_departures",
        schema="public",
        db_name="monitorfish_remote",
    )


with Flow(
    "Extract data of the last DEP message of each vessel in "
    "the ers table, load into last_departures"
) as flow:
    last_departures = extract_last_departures()
    load_last_departure(last_departures)
