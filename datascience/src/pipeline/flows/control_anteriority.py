import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load


@task(checkpoint=False)
def extract_control_anteriority():
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/control_anteriority.sql",
    )


@task(checkpoint=False)
def load_control_anteriority(control_anteriority):

    load(
        control_anteriority,
        table_name="control_anteriority",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        delete_before_insert=True,
    )


with Flow("Control anteriority") as flow:
    control_anteriority = extract_control_anteriority()
    load_control_anteriority(control_anteriority)
