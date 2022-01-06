import geopandas as gpd
import prefect
from prefect import task
from sqlalchemy import Table

from src.db_config import create_engine
from src.pipeline.generic_tasks import extract
from src.pipeline.utils import get_table


@task(checkpoint=False)
def extract_facade_areas() -> gpd.GeoDataFrame:
    """
    Extracts facade areas as a `GeoDataFrame` (subdivided dataset).

    Returns:
        gpd.GeoDataFrame : GeoDataFrame of facade areas.
    """
    return extract(
        db_name="monitorfish_remote",
        query_filepath="monitorfish/facade_areas.sql",
        backend="geopandas",
        geom_col="geometry",
        crs=4326,
    )


@task(checkpoint=False)
def get_facades_table() -> Table:
    """
    Return a `sqlalchemy.Table` representing the table in which facades are stored.

    Returns:
        - ZonesTable: table of positions

    """

    logger = prefect.context.get("logger")

    facades_table = get_table(
        "facade_areas_subdivided",
        schema="public",
        engine=create_engine("monitorfish_remote"),
        logger=logger,
    )

    return facades_table
