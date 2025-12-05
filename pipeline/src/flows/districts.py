import pandas as pd
from prefect import flow, get_run_logger, task

from config import LIBRARY_LOCATION
from src.generic_tasks import load


@task
def extract_districts():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/districts.csv",
        keep_default_na=False,
        na_values=[""],
    )


@task
def load_districts(districts):
    load(
        districts,
        table_name="districts",
        schema="public",
        db_name="monitorfish_remote",
        how="replace",
        logger=get_run_logger(),
    )


@flow(name="Monitorfish - Districts")
def districts_flow():
    districts = extract_districts()
    load_districts(districts)
