import io
import zipfile
from pathlib import Path

import pandas as pd
import requests
from prefect import Flow, Parameter, task

from config import FAO_SPECIES_URL, ISSCAAP_GROUPS_URL, PROXIES


@task(checkpoint=False)
def extract_species(url: str, proxies: dict) -> pd.DataFrame:

    # Extract zipfile from fao.org
    r = requests.get(url, proxies=proxies)
    r.raise_for_status()
    zipobj = zipfile.ZipFile(io.BytesIO(r.content))

    # Find .txt file in zipfile
    files = zipobj.namelist()
    txt_files = list(filter(lambda s: s.split(".")[-1] == "txt", files))
    try:
        assert len(txt_files) == 1
    except AssertionError:
        raise ValueError(f".txt file could not be identifide in {url}")
    txt_file = txt_files[0]

    # Extract .txt file from zipfile
    species = pd.read_csv(zipobj.open(txt_file))

    species = species.rename(
        columns={
            "ISSCAAP": "isscaap_code",
            "TAXOCODE": "taxocode",
            "3A_CODE": "species_code",
            "Scientific_name": "scientific_name",
            "English_name": "english_name",
            "French_name": "french_name",
            "Spanish_name": "spanish_name",
            "Arabic_name": "arabic_name",
            "Chinese_name": "chinese_name",
            "Russian_name": "russian_name",
            "Author": "author",
            "Family": "family",
            "Order": "order",
            "Stats_data": "stats_data",
        }
    )

    return species


@task(checkpoint=False)
def extract_isscaap_groups(url: str, proxies: dict) -> pd.DataFrame:

    # Extract isscaap codes table
    r = requests.get(url, proxies=proxies)
    r.raise_for_status()
    r.encoding = "utf8"
    f = io.StringIO(r.text)
    isscaap_groups = pd.read_csv(f)

    return isscaap_groups


@task(checkpoint=False)
def transform_species(
    species: pd.DataFrame, isscaap_groups: pd.DataFrame
) -> pd.DataFrame:

    res = pd.merge(species, isscaap_groups, on="isscaap_code", how="left")

    res["order"] = res.order.map(str.capitalize)

    column_order = [
        "species_code",
        "taxocode",
        "scientific_name",
        "english_name",
        "french_name",
        "spanish_name",
        "arabic_name",
        "chinese_name",
        "russian_name",
        "author",
        "family",
        "order",
        "stats_data",
        "isscaap_code",
        "isscaap_group_en",
        "isscaap_group_fr",
        "isscaap_group_es",
        "isscaap_division_code",
        "isscaap_division_en",
        "isscaap_division_fr",
        "isscaap_division_es",
    ]

    return res[column_order]


@task(checkpoint=False)
def export_species(species: pd.DataFrame, csv_filepath: str) -> None:
    species.to_csv(csv_filepath, index=False, encoding="utf8")


with Flow("Species") as flow:
    csv_filepath = Parameter("csv_filepath")
    species = extract_species(url=FAO_SPECIES_URL, proxies=PROXIES)
    isscaap_groups = extract_isscaap_groups(url=ISSCAAP_GROUPS_URL, proxies=PROXIES)
    species = transform_species(species, isscaap_groups)
    export_species(species, csv_filepath=csv_filepath)

flow.file_name = Path(__file__).name
