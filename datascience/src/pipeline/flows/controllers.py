from pathlib import Path

import prefect
from prefect import Flow, case, task

from src.pipeline.generic_tasks import extract, load
from src.pipeline.shared_tasks.control_flow import check_flow_not_running


@task(checkpoint=False)
def extract_controllers():
    return extract(db_name="fmc", query_filepath="fmc/controllers.sql")


@task(checkpoint=False)
def load_controllers(controllers):

    load(
        controllers,
        table_name="controllers",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


with Flow("Controllers") as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        controllers = extract_controllers()
        load_controllers(controllers)

flow.file_name = Path(__file__).name
