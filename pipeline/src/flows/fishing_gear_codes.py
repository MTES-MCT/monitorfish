import pandas as pd
from prefect import flow, get_run_logger, task

from config import LIBRARY_LOCATION
from src.generic_tasks import load


@task
def extract_fishing_gear_codes():
    return pd.read_csv(LIBRARY_LOCATION / "data/fishing_gear_codes.csv")


@task
def extract_fishing_gear_codes_groups():
    return pd.read_csv(LIBRARY_LOCATION / "data/fishing_gear_codes_groups.csv")


@task
def load_fishing_gear_codes(fishing_gear_codes):
    logger = get_run_logger()

    load(
        fishing_gear_codes,
        table_name="fishing_gear_codes",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


@task
def load_fishing_gear_codes_groups(fishing_gear_codes_groups):
    logger = get_run_logger()

    load(
        fishing_gear_codes_groups,
        table_name="fishing_gear_codes_groups",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


@flow(name="Fishing gears")
def fishing_gear_codes_flow():
    fishing_gear_codes = extract_fishing_gear_codes()
    fishing_gear_codes_groups = extract_fishing_gear_codes_groups()
    load_fishing_gear_codes_groups(fishing_gear_codes_groups)
    load_fishing_gear_codes(fishing_gear_codes)
