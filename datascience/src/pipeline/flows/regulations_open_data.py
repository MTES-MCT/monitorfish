from io import BytesIO

import geopandas as gpd
import pandas as pd
from prefect import Flow, Parameter, case, task
from prefect.executors import LocalDaskExecutor

from config import (
    REGULATIONS_CSV_RESOURCE_ID,
    REGULATIONS_CSV_RESOURCE_TITLE,
    REGULATIONS_DATASET_ID,
    REGULATIONS_GEOPACKAGE_RESOURCE_ID,
    REGULATIONS_GEOPACKAGE_RESOURCE_TITLE,
    ROOT_DIRECTORY,
)
from src.pipeline.generic_tasks import extract
from src.pipeline.shared_tasks.control_flow import check_flow_not_running
from src.pipeline.shared_tasks.datagouv import update_resource
from src.pipeline.utils import remove_file


@task(checkpoint=False)
def extract_regulations_open_data() -> gpd.GeoDataFrame:
    return extract(
        "monitorfish_remote",
        "monitorfish/regulations_open_data.sql",
        backend="geopandas",
        geom_col="geometry",
    )


@task(checkpoint=False)
def get_regulations_for_csv(regulations: gpd.GeoDataFrame) -> pd.DataFrame:

    columns = [
        "type_de_reglementation",
        "thematique",
        "zone",
        "reglementations",
        "wkt",
    ]

    return pd.DataFrame(regulations[columns])


@task(checkpoint=False)
def get_regulations_for_geopackage(regulations: gpd.GeoDataFrame) -> gpd.GeoDataFrame:

    columns = [
        "type_de_reglementation",
        "thematique",
        "zone",
        "reglementations",
        "geometry",
    ]

    return regulations[columns].copy(deep=True)


@task(checkpoint=False)
def get_csv_file_object(df: pd.DataFrame) -> BytesIO:
    """
    Returns a `BytesIO` csv file object from the input `DataFrame`.
    Useful to upload a `DataFrame` to data.gouv.fr

    The index is not included in the output csv file.

    Args:
        df (pd.DataFrame): DataFrame to convert

    Returns:
        BytesIO: file object

    Examples:
        import pandas as pd
        >>> df = pd.DataFrame({"a": [10, 20, 30], "b": [40, 50, 60]})
        >>> df
                a   b
            0  10  40
            1  20  50
            2  30  60
        >>> buf = df_to_csv_file_object.run(df)
        >>> pd.read_csv(buf)
                a   b
            0  10  40
            1  20  50
            2  30  60
    """
    buf = BytesIO()
    df.to_csv(buf, mode="wb", index=False)
    buf.seek(0)
    return buf


@task(checkpoint=False)
def get_geopackage_file_object(gdf: gpd.GeoDataFrame, layers: str = None) -> BytesIO:
    """
    Returns a `BytesIO` geopackage file object. from the input `GeoDataFrame`.

    If `layers` is given, the geopackage will be organized in layers according to the
    data labels of the `layers` column. If there are null values in the `layers` column,
    the corresponding rows will not be included in the geopackage.

    Args:
        gdf (gpd.DataFrame): GeoDataFrame to convert
        layers (str, optional): name of the column to use as layer labels in the
          geopackage. Defaults to None.

    Returns:
        BytesIO: file object

    Examples:
        import geopandas as gpd
        from shapely.geometry import Point
        >>> gdf = gpd.GeoDataFrame({
            "a": [10, 20, 30],
            "geometry": [Point(1, 2), Point(3, 4), Point(5, 6)]
        })
        >>> gdf
                a                 geometry
            0  10  POINT (1.00000 2.00000)
            1  20  POINT (3.00000 4.00000)
            2  30  POINT (5.00000 6.00000)
        >>> buf = get_geopackage_file_object.run(gdf)
        >>> gpd.read_file(buf, driver="GPKG")
                a                 geometry
            0  10  POINT (1.00000 2.00000)
            1  20  POINT (3.00000 4.00000)
            2  30  POINT (5.00000 6.00000)
    """

    buf = BytesIO()

    if layers:
        temp_file_path = ROOT_DIRECTORY / "src/pipeline/data/tmp_geopackage.gpkg"
        remove_file(temp_file_path, ignore_errors=True)

        try:
            for layer in gdf[layers].dropna().unique():

                gdf[gdf[layers] == layer].to_file(
                    temp_file_path, driver="GPKG", layer=layer
                )

            with open(temp_file_path, "rb") as f:
                buf.write(f.read())

        finally:
            remove_file(temp_file_path, ignore_errors=True)

    else:
        gdf.to_file(buf, driver="GPKG")

    buf.seek(0)
    return buf


with Flow("Regulations open data", executor=LocalDaskExecutor()) as flow:

    flow_not_running = check_flow_not_running()
    with case(flow_not_running, True):

        dataset_id = Parameter("dataset_id", default=REGULATIONS_DATASET_ID)
        csv_resource_id = Parameter(
            "csv_resource_id", default=REGULATIONS_CSV_RESOURCE_ID
        )
        gpkg_resource_id = Parameter(
            "gpkg_resource_id", default=REGULATIONS_GEOPACKAGE_RESOURCE_ID
        )
        csv_resource_title = Parameter(
            "csv_resource_title", default=REGULATIONS_CSV_RESOURCE_TITLE
        )
        gpkg_resource_title = Parameter(
            "gpkg_resource_title", default=REGULATIONS_GEOPACKAGE_RESOURCE_TITLE
        )

        regulations = extract_regulations_open_data()

        regulations_for_csv = get_regulations_for_csv(regulations)
        regulations_for_geopackage = get_regulations_for_geopackage(regulations)

        csv_file = get_csv_file_object(regulations_for_csv)
        geopackage_file = get_geopackage_file_object(
            regulations_for_geopackage, layers="type_de_reglementation"
        )

        update_resource(
            dataset_id=dataset_id,
            resource_id=csv_resource_id,
            resource_title=csv_resource_title,
            resource=csv_file,
        )

        update_resource(
            dataset_id=dataset_id,
            resource_id=gpkg_resource_id,
            resource_title=gpkg_resource_title,
            resource=geopackage_file,
        )
