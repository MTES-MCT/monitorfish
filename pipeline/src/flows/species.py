import io

import pandas as pd
import requests
from prefect import flow, get_run_logger, task

from config import DATA_GOUV_SPECIES_URL, PROXIES
from src.generic_tasks import load
from src.processing import coalesce


@task
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


@task
def transform_species(species: pd.DataFrame) -> pd.DataFrame:
    res = species.copy(deep=True)

    # Coalesce french_name and scientific_name
    name_columns = ["french_name", "scientific_name"]
    res["species_name"] = coalesce(res[name_columns])
    res = res.drop(columns=name_columns)

    # ADD BFT calibers
    res = pd.concat(
        [
            res,
            pd.DataFrame(
                {
                    "species_code": ["BF1", "BF2", "BF3"],
                    "species_name": [
                        "Thon rouge de l'Atlantique (Calibre 1)",
                        "Thon rouge de l'Atlantique (Calibre 2)",
                        "Thon rouge de l'Atlantique (Calibre 3)",
                    ],
                }
            ),
        ],
        axis=0,
    ).reset_index(drop=True)

    # Add id column
    res["id"] = res.index.values

    # Add SCIP species type
    pelagic_species = [
        "ALB",
        "ANE",
        "WHB",
        "BOC",
        "BOR",
        "HER",
        "ARU",
        "JAX",
        "HOM",
        "HMM",
        "PIL",
        "SPR",
        "SAN",
        "NOP",
        "MAC",
    ]
    demersal_species = [
        "ALF",
        "ANF",
        "ANK",
        "BLI",
        "BSF",
        "COD",
        "ELE",
        "GFB",
        "GHL",
        "HAD",
        "HKE",
        "LDB",
        "LEZ",
        "LIN",
        "MEG",
        "MNZ",
        "MON",
        "NEP",
        "PLE",
        "POK",
        "PRA",
        "RHG",
        "RJC",
        "RJE",
        "RJF",
        "RJH",
        "RJI",
        "RJM",
        "RJN",
        "RJU",
        "RNG",
        "SBR",
        "SOL",
        "SOO",
        "SRX",
        "USK",
        "WHG",
    ]
    tuna = ["BFT", "SWO", "YFT", "SKJ", "BET", "BF1", "BF2", "BF3"]
    other = ["DPS", "LKJ", "ARA", "ARS", "MUT", "MUX", "COL", "DOL"]

    species_type = {
        **{s: "PELAGIC" for s in pelagic_species},
        **{s: "DEMERSAL" for s in demersal_species},
        **{s: "TUNA" for s in tuna},
        **{s: "OTHER" for s in other},
    }

    res["scip_species_type"] = res.species_code.map(species_type)

    return res


@task
def load_species(species: pd.DataFrame):
    load(
        species,
        table_name="species",
        schema="public",
        db_name="monitorfish_remote",
        logger=get_run_logger(),
        how="replace",
        replace_with_truncate=True,
    )


@flow(name="Species")
def species_flow(extract_species_task=extract_species):
    species = extract_species_task(url=DATA_GOUV_SPECIES_URL, proxies=PROXIES)
    species = transform_species(species)
    load_species(species)
