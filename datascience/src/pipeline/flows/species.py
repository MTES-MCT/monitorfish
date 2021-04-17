import pandas as pd
import prefect
from prefect import Flow, task
from prefect.utilities.context import Context

from src.pipeline.generic_tasks import extract, load


@task(checkpoint=False)
def extract_species():
    return extract("fmc", "fmc/species.sql")


@task(checkpoint=False)
def load_species(species: pd.DataFrame):

    load(
        species,
        table_name="species",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        delete_before_insert=True,
    )


with Flow("Extract species codes") as flow:
    species = extract_species()
    load_species(species)
