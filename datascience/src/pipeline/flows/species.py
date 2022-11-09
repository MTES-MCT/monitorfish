import io
from pathlib import Path

import pandas as pd
import prefect
import requests
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from config import DATA_GOUV_SPECIES_URL, PROXIES
from src.pipeline.generic_tasks import load
from src.pipeline.processing import coalesce


@task(checkpoint=False)
def extract_species(url: str, proxies: dict) -> pd.DataFrame:
    r = requests.get(url, proxies=proxies)
    r.encoding = "utf8"
    f = io.StringIO(r.text)

    usecols = [
        "species_code",
        "scientific_name",
        "french_name",
    ]

    species = pd.read_csv(f, usecols=usecols)
    return species


@task(checkpoint=False)
def transform_species(species: pd.DataFrame) -> pd.DataFrame:

    res = species.copy(deep=True)

    # Coalesce french_name and scientific_name
    name_columns = ["french_name", "scientific_name"]
    res["species_name"] = coalesce(res[name_columns])
    res = res.drop(columns=name_columns)

    # Add id column
    res["id"] = res.index.values

    return res


@task(checkpoint=False)
def load_species(species: pd.DataFrame):

    load(
        species,
        table_name="species",
        schema="public",
        db_name="monitorfish_remote",
        logger=prefect.context.get("logger"),
        how="replace",
    )


with Flow("Species", executor=LocalDaskExecutor()) as flow:
    species = extract_species(url=DATA_GOUV_SPECIES_URL, proxies=PROXIES)
    species = transform_species(species)
    load_species(species)

flow.file_name = Path(__file__).name
