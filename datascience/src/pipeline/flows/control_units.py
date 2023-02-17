from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor
from sqlalchemy import DDL

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract, load
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_control_units() -> pd.DataFrame:
    return extract(
        db_name="monitorenv_remote", query_filepath="monitorenv/control_units.sql"
    )


@task(checkpoint=False)
def extract_administrations() -> pd.DataFrame:
    return extract(
        db_name="monitorenv_remote", query_filepath="monitorenv/administrations.sql"
    )


@task(checkpoint=False)
def load_analytics_control_units_and_administrations(
    control_units: pd.DataFrame, administrations: pd.DataFrame
):
    logger = prefect.context.get("logger")

    e = create_engine("monitorfish_remote")
    with e.begin() as connection:

        load(
            administrations,
            table_name="analytics_administrations",
            schema="public",
            connection=connection,
            logger=logger,
            how="replace",
            init_ddls=[
                DDL(
                    "ALTER TABLE public.analytics_control_units "
                    "DROP CONSTRAINT analytics_control_units_administration_id_fkey;"
                )
            ],
        )

        load(
            control_units,
            table_name="analytics_control_units",
            schema="public",
            connection=connection,
            logger=logger,
            how="replace",
            init_ddls=[
                DDL(
                    "ALTER TABLE public.analytics_missions_control_units "
                    "DROP CONSTRAINT "
                    "analytics_missions_control_units_control_unit_id_fkey"
                )
            ],
            end_ddls=[
                DDL(
                    "ALTER TABLE public.analytics_control_units "
                    "ADD CONSTRAINT analytics_control_units_administration_id_fkey "
                    "FOREIGN KEY (administration_id) "
                    "REFERENCES public.analytics_administrations(id);"
                ),
                DDL(
                    "ALTER TABLE public.analytics_missions_control_units "
                    "ADD CONSTRAINT "
                    "analytics_missions_control_units_control_unit_id_fkey "
                    "FOREIGN KEY (control_unit_id) "
                    "REFERENCES public.analytics_control_units(id);"
                ),
            ],
        )


with Flow("Control units", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        control_units = extract_control_units()
        administrations = extract_administrations()
        load_analytics_control_units_and_administrations(control_units, administrations)

flow.file_name = Path(__file__).name
