import geopandas as gpd
import requests
from prefect import Task, flow, get_run_logger, task

from config import FAO_AREAS_URL, PROXIES
from src.generic_tasks import load


@task
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


@task
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


@task
def load_fao_areas(fao_areas: gpd.GeoDataFrame):
    logger = get_run_logger()

    load(
        fao_areas,
        table_name="fao_areas",
        schema="public",
        db_name="monitorfish_remote",
        logger=logger,
        how="replace",
        replace_with_truncate=True,
    )


@flow(name="FAO areas")
def fao_areas_flow(
    url: str = FAO_AREAS_URL,
    proxies: dict = PROXIES,
    extract_fao_areas_fn: Task = extract_fao_areas,
):
    fao_areas = extract_fao_areas_fn(url=url, proxies=proxies)
    fao_areas = transform_fao_areas(fao_areas)
    load_fao_areas(fao_areas)
