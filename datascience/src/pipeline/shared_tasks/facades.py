import geopandas as gpd
from prefect import task

from src.pipeline.generic_tasks import extract


@task(checkpoint=False)
def extract_facade_areas() -> gpd.GeoDataFrame:
    """
    Extracts facade areas as a `GeoDataFrame`.

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
