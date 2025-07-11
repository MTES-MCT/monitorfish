from io import BytesIO

import geopandas as gpd
import pandas as pd
import requests
from prefect import get_run_logger, task

from config import DATAGOUV_API_ENDPOINT, DATAGOUV_API_KEY, PROXIES, ROOT_DIRECTORY
from src.utils import remove_file

HEADERS = {
    "X-API-KEY": DATAGOUV_API_KEY,
}


def api_url(path: str):
    return DATAGOUV_API_ENDPOINT + path


@task
def update_resource(
    dataset_id: str,
    resource_id: str,
    resource_title: str,
    resource: BytesIO,
    mock_update: bool,
):
    """
    Update the designated resource on data.gouv.fr

    Args:
        dataset_id (str): dataset id to update on data.gouv.fr
        resource_id (str): resource id to update on data.gouv.fr
        resource_title (str): title of the resource file after upload
        resource (BytesIO): resource to upload
        mock_update (bool): if ``True``, the post request is not actually sent

    Returns:
        requests.Response: Response object
    """
    logger = get_run_logger()

    url = api_url(f"/datasets/{dataset_id}/resources/{resource_id}/upload/")

    if not mock_update:
        logger.info(f"Updating resource on {url}")
        response = requests.post(
            url,
            files={"file": (resource_title, resource)},
            headers=HEADERS,
            proxies=PROXIES,
        )
        response.raise_for_status()

    else:
        logger.info(f"Mocking update on resource on {url}")
        response = requests.Response()
        response.url = url
        response.status_code = 200
    return response


@task
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


@task
def get_geopackage_file_object(gdf: gpd.GeoDataFrame, layers: str = None) -> BytesIO:
    """
    Returns a `BytesIO` geopackage file object. from the input `GeoDataFrame`.
    Useful to upload a `GeoDataFrame` to data.gouv.fr

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
        # Tried using tempfile.TemporaryFile without success.
        # Try again at your own risk :)
        temp_file_path = ROOT_DIRECTORY / "src/data/tmp_geopackage.gpkg"
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
