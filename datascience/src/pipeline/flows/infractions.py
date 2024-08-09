from pathlib import Path

import prefect
from prefect import Flow, case, task
from prefect.executors import LocalDaskExecutor

from src.pipeline.generic_tasks import extract, load
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_infractions():
    return extract("fmc", "fmc/natinf.sql")


@task(checkpoint=False)
def clean_infractions(infractions):
    infractions.loc[:, "infraction"] = infractions.infraction.map(str.capitalize)
    return infractions


@task(checkpoint=False)
def load_infractions(infractions):
    load(
        infractions,
        table_name="infractions",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
        replace_with_truncate=True,
    )


with Flow("Infractions", executor=LocalDaskExecutor()) as flow:
    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):
        infractions = extract_infractions()
        infractions = clean_infractions(infractions)
        load_infractions(infractions)

flow.file_name = Path(__file__).name
