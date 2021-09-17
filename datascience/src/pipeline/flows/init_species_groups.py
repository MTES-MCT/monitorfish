import io

import pandas as pd
import prefect
import requests
from dotenv import load_dotenv
from prefect import Flow, Parameter, task

from config import FLEET_SEGMENTS_URL, LIBRARY_LOCATION, PROXIES
from src.pipeline.generic_tasks import load

load_dotenv()


@task(checkpoint=False)
def extract_species_groups():
    return pd.read_csv(
        LIBRARY_LOCATION / "pipeline/data/species_groups.csv", encoding="utf8"
    )


@task(checkpoint=False)
def extract_species_codes_groups():
    return pd.read_csv(
        LIBRARY_LOCATION / "pipeline/data/species_codes_groups.csv", encoding="utf8"
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


with Flow("Species groups") as flow:
    species_groups = extract_species_groups()
    species_codes_groups = extract_species_codes_groups()
    load_species_groups(species_groups, species_codes_groups)
