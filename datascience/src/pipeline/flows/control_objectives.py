from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from config import LIBRARY_LOCATION
from src.pipeline.generic_tasks import load


@task(checkpoint=False)
def extract_control_objectives():
    return pd.read_csv(LIBRARY_LOCATION / "pipeline/data/control_objectives.csv")


@task(checkpoint=False)
def load_control_objectives(control_objectives):
    load(
        control_objectives,
        table_name="control_objectives",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


with Flow("Control_objectives", executor=LocalDaskExecutor()) as flow:
    control_objectives = extract_control_objectives()
    load_control_objectives(control_objectives)

flow.file_name = Path(__file__).name
