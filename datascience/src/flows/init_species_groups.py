from pathlib import Path

import pandas as pd
import prefect
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from config import LIBRARY_LOCATION
from src.generic_tasks import load


@task(checkpoint=False)
def extract_species_groups():
    return pd.read_csv(LIBRARY_LOCATION / "data/species_groups.csv", encoding="utf8")


@task(checkpoint=False)
def extract_species_codes_groups():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/species_codes_groups.csv", encoding="utf8"
    )


@task(checkpoint=False)
def load_species_groups(species_groups, species_codes_groups):
    load(
        species_groups,
        table_name="species_groups",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )

    load(
        species_codes_groups,
        table_name="species_codes_groups",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


with Flow("Species groups", executor=LocalDaskExecutor()) as flow:
    species_groups = extract_species_groups()
    species_codes_groups = extract_species_codes_groups()
    load_species_groups(species_groups, species_codes_groups)

flow.file_name = Path(__file__).name
