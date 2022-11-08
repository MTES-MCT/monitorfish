from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from config import LIBRARY_LOCATION
from src.pipeline.generic_tasks import load


@task(checkpoint=False)
def extract_fishing_gear_codes():
    return pd.read_csv(LIBRARY_LOCATION / "pipeline/data/fishing_gear_codes.csv")


@task(checkpoint=False)
def extract_fishing_gear_codes_groups():
    return pd.read_csv(LIBRARY_LOCATION / "pipeline/data/fishing_gear_codes_groups.csv")


@task(checkpoint=False)
def load_fishing_gear_codes(fishing_gear_codes):
    load(
        fishing_gear_codes,
        table_name="fishing_gear_codes",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


@task(checkpoint=False)
def load_fishing_gear_codes_groups(fishing_gear_codes_groups):
    load(
        fishing_gear_codes_groups,
        table_name="fishing_gear_codes_groups",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


with Flow("Fishing gears", executor=LocalDaskExecutor()) as flow:
    fishing_gear_codes = extract_fishing_gear_codes()
    fishing_gear_codes_groups = extract_fishing_gear_codes_groups()
    load_fishing_gear_codes_groups(fishing_gear_codes_groups)
    load_fishing_gear_codes(fishing_gear_codes)

flow.file_name = Path(__file__).name
