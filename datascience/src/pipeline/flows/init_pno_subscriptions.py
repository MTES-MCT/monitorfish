from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from config import NON_COMMITED_DATA_LOCATION
from src.pipeline.generic_tasks import load
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_pno_ports_subscriptions(filename: str):
    return pd.read_csv(
        NON_COMMITED_DATA_LOCATION / filename,
        encoding="utf8",
        dtype={"receive_all_pnos": bool},
    )


@task(checkpoint=False)
def extract_pno_segments_subscriptions(filename: str):
    return pd.read_csv(
        NON_COMMITED_DATA_LOCATION / filename,
        encoding="utf8",
    )


@task(checkpoint=False)
def extract_pno_vessels_subscriptions(filename: str):
    return pd.read_csv(
        NON_COMMITED_DATA_LOCATION / filename,
        encoding="utf8",
    )


@task(checkpoint=False)
def load_pno_ports_subscriptions(pno_ports_subscriptions: pd.DataFrame):
    logger = prefect.context.get("logger")
    load(
        pno_ports_subscriptions,
        table_name="pno_ports_subscriptions",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


@task(checkpoint=False)
def load_pno_segments_subscriptions(pno_segments_subscriptions: pd.DataFrame):
    logger = prefect.context.get("logger")
    load(
        pno_segments_subscriptions,
        table_name="pno_segments_subscriptions",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


@task(checkpoint=False)
def load_pno_vessels_subscriptions(pno_vessels_subscriptions: pd.DataFrame):
    logger = prefect.context.get("logger")
    load(
        pno_vessels_subscriptions,
        table_name="pno_vessels_subscriptions",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


with Flow("Init pno subscriptions", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        pno_ports_subscriptions_file_name = Parameter(
            "pno_ports_subscriptions_file_name"
        )
        pno_segments_subscriptions_file_name = Parameter(
            "pno_segments_subscriptions_file_name"
        )
        pno_vessels_subscriptions_file_name = Parameter(
            "pno_vessels_subscriptions_file_name"
        )
        pno_ports_subscriptions = extract_pno_ports_subscriptions(
            pno_ports_subscriptions_file_name
        )
        pno_segments_subscriptions = extract_pno_segments_subscriptions(
            pno_segments_subscriptions_file_name
        )
        pno_vessels_subscriptions = extract_pno_vessels_subscriptions(
            pno_vessels_subscriptions_file_name
        )
        load_pno_ports_subscriptions(pno_ports_subscriptions)
        load_pno_segments_subscriptions(pno_segments_subscriptions)
        load_pno_vessels_subscriptions(pno_vessels_subscriptions)

flow.file_name = Path(__file__).name
