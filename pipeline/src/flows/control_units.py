import pandas as pd
from prefect import flow, get_run_logger, task

from src.db_config import create_engine
from src.generic_tasks import extract, load


@task
def extract_control_units() -> pd.DataFrame:
    return extract(
        db_name="monitorenv_remote", query_filepath="monitorenv/control_units.sql"
    )


@task
def extract_administrations() -> pd.DataFrame:
    return extract(
        db_name="monitorenv_remote", query_filepath="monitorenv/administrations.sql"
    )


@task
def load_analytics_control_units_and_administrations(
    control_units: pd.DataFrame, administrations: pd.DataFrame
):
    logger = get_run_logger()

    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        load(
            administrations,
            table_name="analytics_administrations",
            schema="public",
            connection=connection,
            logger=logger,
            how="replace",
            replace_with_truncate=True,
        )

        load(
            control_units,
            table_name="analytics_control_units",
            schema="public",
            connection=connection,
            logger=logger,
            how="replace",
            replace_with_truncate=True,
        )


@flow(name="Control units")
def control_units_flow(
    extract_control_units_fn=extract_control_units,
    extract_administrations_fn=extract_administrations,
):
    control_units = extract_control_units_fn()
    administrations = extract_administrations_fn()
    load_analytics_control_units_and_administrations(control_units, administrations)
