import pandas as pd
from prefect import flow, get_run_logger, task

from config import LIBRARY_LOCATION
from src.generic_tasks import load


@task
def extract_species_groups():
    return pd.read_csv(LIBRARY_LOCATION / "data/species_groups.csv", encoding="utf8")


@task
def extract_species_codes_groups():
    return pd.read_csv(
        LIBRARY_LOCATION / "data/species_codes_groups.csv", encoding="utf8"
    )


@task
def load_species_groups(species_groups, species_codes_groups):
    logger = get_run_logger()

    load(
        species_groups,
        table_name="species_groups",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )

    load(
        species_codes_groups,
        table_name="species_codes_groups",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
    )


@flow(name="Monitorfish - Species groups")
def init_species_groups_flow():
    species_groups = extract_species_groups()
    species_codes_groups = extract_species_codes_groups()
    load_species_groups(species_groups, species_codes_groups)
