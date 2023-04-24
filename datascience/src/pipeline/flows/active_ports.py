from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, case, task
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.utils import psql_insert_copy


@task(checkpoint=False)
def compute_ports_activity_status() -> pd.DataFrame:
    """
    Returns ports with the `is_active` status, i.e. whether there has been :

      - one or more PNO declaration in the last 2 years OR
      - one or more LAN declaration in the last 2 years OR
      - one or more controls in the last 5 years

    Returns:
        pd.DataFrame: DataFrame of ports with columns `port_locode` and `is_active`.
    """
    ports_activity_status = extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/compute_ports_activity_status.sql",
    )

    return ports_activity_status


@task(checkpoint=False)
def load_ports_activity_status(ports_activity_status: pd.DataFrame):

    logger = prefect.context.get("logger")

    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        logger.info("Creating temporary table")
        connection.execute(
            text(
                "CREATE TEMP TABLE tmp_ports_activity_statuses("
                "    locode VARCHAR PRIMARY KEY, "
                "    is_active BOOLEAN"
                ")"
                "ON COMMIT DROP;"
            )
        )

        logger.info("Loading to temporary table")

        ports_activity_status.to_sql(
            "tmp_ports_activity_statuses",
            connection,
            if_exists="append",
            index=False,
            method=psql_insert_copy,
        )

        logger.info("Updating ports activity statuses from temporary table")

        connection.execute(
            text(
                "UPDATE public.ports p "
                "SET is_active = pas.is_active "
                "FROM tmp_ports_activity_statuses pas "
                "WHERE p.locode = pas.locode;"
            ),
        )


with Flow("Active ports") as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        ports_activity_status = compute_ports_activity_status()
        load_ports_activity_status(ports_activity_status)


flow.file_name = Path(__file__).name
