import pickle
from io import BytesIO

import geopandas as gpd
import prefect
import requests
from prefect import Flow, task
from shapely.geometry import MultiPolygon, Polygon

from config import FAO_AREAS_URL, PROXIES
from src.pipeline.generic_tasks import load
from src.pipeline.helpers.spatial import to_multipolygon


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

    shapefile = requests.get(url, proxies=proxies)
    shapefile.raise_for_status()
    fao_areas = gpd.read_file(BytesIO(shapefile.content))

    return fao_areas


@task(checkpoint=False)
def transform_fao_areas(fao_areas: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """
    Transforms the ``fao_areas`` DataFrame to match the desired table columns.
    """

    fao_areas = fao_areas.copy(deep=True)
    fao_areas.columns = fao_areas.columns.map(str.lower)
    fao_areas = fao_areas.drop(columns=["id"])

    fao_areas = gpd.GeoDataFrame(
        fao_areas.astype(
            {
                "f_code": str,
                "f_level": str,
                "f_status": float,
                "ocean": str,
                "subocean": str,
                "f_area": str,
                "f_subarea": str,
                "f_division": str,
                "f_subdivis": str,
                "f_subunit": str,
                "name_en": str,
                "name_fr": str,
                "name_es": str,
                "surface": float,
            }
        )
    )

    fao_areas = fao_areas.rename(columns={"geometry": "wkb_geometry"})
    fao_areas = fao_areas.set_geometry("wkb_geometry")
    fao_areas["wkb_geometry"] = fao_areas.wkb_geometry.map(to_multipolygon)

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
    )


with Flow("FAO areas") as flow:
    fao_areas = extract_fao_areas(url=FAO_AREAS_URL, proxies=PROXIES)
    fao_areas = transform_fao_areas(fao_areas)
    load_fao_areas(fao_areas)
