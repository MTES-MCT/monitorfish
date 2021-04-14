import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load


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
        delete_before_insert=True,
    )


with Flow("Update controllers reference") as flow:
    controllers = extract_controllers()
    load_controllers(controllers)
