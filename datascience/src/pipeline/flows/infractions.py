from pathlib import Path

import prefect
from prefect import Flow, task

from src.pipeline.generic_tasks import extract, load


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
    )


with Flow("Infractions") as flow:
    infractions = extract_infractions()
    infractions = clean_infractions(infractions)
    load_infractions(infractions)

flow.file_name = Path(__file__).name
