import io
import zipfile

import pandas as pd
import requests
from prefect import flow, task

from config import (
    FAO_SPECIES_URL,
    IS_INTEGRATION,
    ISSCAAP_GROUPS_URL,
    PROXIES,
    SPECIES_CSV_RESOURCE_ID,
    SPECIES_CSV_RESOURCE_TITLE,
    SPECIES_DATASET_ID,
)
from src.sentry import report_flow_failure_to_sentry
from src.shared_tasks.datagouv import get_csv_file_object, update_resource


@task
def extract_species(url: str, proxies: dict) -> pd.DataFrame:
    # Extract zipfile from fao.org
    r = requests.get(url, proxies=proxies)
    r.raise_for_status()
    zipobj = zipfile.ZipFile(io.BytesIO(r.content))

    csv_files = [f for f in zipobj.namelist() if f.lower().endswith(".csv")]
    if len(csv_files) != 1:
        raise ValueError(f"A single .csv file could not be identified in {url}")

    species = pd.read_csv(zipobj.open(csv_files[0]), encoding="utf-8-sig")
    species.columns = species.columns.str.strip()

    species = species.rename(
        columns={
            "ISSCAAP_Group": "isscaap_code",
            "Taxonomic_Code": "taxocode",
            "Alpha3_Code": "species_code",
            "Scientific_Name": "scientific_name",
            "English_name": "english_name",
            "French_name": "french_name",
            "Spanish_name": "spanish_name",
            "Arabic_name": "arabic_name",
            "Chinese_name": "chinese_name",
            "Russian_name": "russian_name",
            "Author": "author",
            "Family": "family",
            "Order or higher taxa": "order",
            "FishStat_Data": "stats_data",
        }
    )

    return species


@task
def extract_isscaap_groups(url: str, proxies: dict) -> pd.DataFrame:
    # Extract isscaap codes table
    r = requests.get(url, proxies=proxies)
    r.raise_for_status()
    r.encoding = "utf8"
    f = io.StringIO(r.text)
    isscaap_groups = pd.read_csv(f)

    return isscaap_groups


@task
def transform_species(
    species: pd.DataFrame, isscaap_groups: pd.DataFrame
) -> pd.DataFrame:
    res = pd.merge(species, isscaap_groups, on="isscaap_code", how="left")

    res["order"] = res.order.str.capitalize()

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


@flow(
    name="Monitorfish - Export Species",
    on_failure=[report_flow_failure_to_sentry],
    on_crashed=[report_flow_failure_to_sentry],
)
def export_species_flow(
    dataset_id: str = SPECIES_DATASET_ID,
    species_resource_id: str = SPECIES_CSV_RESOURCE_ID,
    species_resource_title: str = SPECIES_CSV_RESOURCE_TITLE,
    is_integration: bool = IS_INTEGRATION,
):
    species = extract_species(url=FAO_SPECIES_URL, proxies=PROXIES)
    isscaap_groups = extract_isscaap_groups(url=ISSCAAP_GROUPS_URL, proxies=PROXIES)
    species = transform_species(species, isscaap_groups)
    species_csv_file = get_csv_file_object(species)

    species_response = update_resource(
        dataset_id=dataset_id,
        resource_id=species_resource_id,
        resource_title=species_resource_title,
        resource=species_csv_file,
        mock_update=is_integration,
    )

    return species_response, species_csv_file
