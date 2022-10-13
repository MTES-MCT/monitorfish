from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task

from config import LIBRARY_LOCATION
from src.pipeline.generic_tasks import load


@task(checkpoint=False)
def extract_districts():
    return pd.read_csv(
        LIBRARY_LOCATION / "pipeline/data/districts.csv",
        keep_default_na=False,
        na_values=[""],
    )


@task(checkpoint=False)
def load_districts(districts):
    load(
        districts,
        table_name="districts",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


with Flow("Districts") as flow:
    districts = extract_districts()
    load_districts(districts)

flow.file_name = Path(__file__).name
