from pathlib import Path

import geopandas as gpd
import prefect
import requests
from prefect import Flow, task
from prefect.executors import LocalDaskExecutor

from config import FAO_AREAS_URL, PROXIES
from src.pipeline.generic_tasks import load


@task(checkpoint=False)
def extract_fao_areas(url: str, proxies: dict) -> gpd.GeoDataFrame:
    """
    Download shapefile of FAO areas and load to GeoDataFrame.

    Args:
        url (str): url to fetch the shapefile from
        proxies (dict): http and https proxies to use for the download.

    Returns:
        gpd.GeoDataFrame: GeoDataFrame of FAO areas
    """

    r = requests.get(url, proxies=proxies)
    r.raise_for_status()
    fao_areas = gpd.read_file(r.text)
    return fao_areas


@task(checkpoint=False)
def transform_fao_areas(fao_areas: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """
    Transforms the ``fao_areas`` DataFrame to match the desired table columns.
    """

    fao_areas = fao_areas.copy(deep=True)
    fao_areas.columns = fao_areas.columns.map(str.lower)
    fao_areas = fao_areas.drop(columns=["id"])
    fao_areas = gpd.GeoDataFrame(fao_areas)
    fao_areas = fao_areas.rename(columns={"geometry": "wkb_geometry"})
    fao_areas = fao_areas.set_geometry("wkb_geometry")

    return fao_areas


@task(checkpoint=False)
def load_fao_areas(fao_areas: gpd.GeoDataFrame):
    logger = prefect.context.get("logger")

    load(
        fao_areas,
        table_name="fao_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
        replace_with_truncate=True,
    )


with Flow("FAO areas", executor=LocalDaskExecutor()) as flow:
    fao_areas = extract_fao_areas(url=FAO_AREAS_URL, proxies=PROXIES)
    fao_areas = transform_fao_areas(fao_areas)
    load_fao_areas(fao_areas)

flow.file_name = Path(__file__).name
