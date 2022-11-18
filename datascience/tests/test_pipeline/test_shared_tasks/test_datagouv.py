from io import BytesIO
from unittest.mock import patch

import fiona
import geopandas as gpd
import pandas as pd
from shapely.geometry import MultiPolygon

from src.pipeline.shared_tasks.datagouv import (
    api_url,
    get_csv_file_object,
    get_geopackage_file_object,
    update_resource,
)


def make_square_multipolygon(
    init_lon,
    init_lat,
    width,
    height,
):
    return MultiPolygon(
        [
            (
                (
                    (init_lon, init_lat),
                    (init_lon + width, init_lat),
                    (init_lon + width, init_lat + height),
                    (init_lon, init_lat + height),
                ),
                [],
            )
        ]
    )


def test_api_url():
    assert api_url("/some/path/") == "https://www.data.gouv.fr/api/1/some/path/"


@patch("src.pipeline.shared_tasks.datagouv.requests")
def test_update_resource(mock_requests):

    resource = BytesIO(b"some file object")

    update_resource.run(
        dataset_id="123",
        resource_id="666",
        resource_title="File title",
        resource=resource,
    )

    assert len(mock_requests.method_calls) == 1

    mock_requests.post.assert_called_once_with(
        "https://www.data.gouv.fr/api/1/datasets/123/resources/666/upload/",
        files={"file": ("File title", resource)},
        headers={"X-API-KEY": "datagouv_api_key"},
        proxies={
            "http": "http://some.ip.address:port",
            "https": "http://some.ip.address:port",
        },
    )


def test_get_csv_file_object():

    input_df = pd.DataFrame(
        {
            "ints": [1, 2, 3],
            "strings": ["a", "b", "c"],
            "floats": [1.0, 2.3, 10.5],
            "nullable_ints": [1, 2, None],
            "nullable_strings": ["a", "b", None],
            "nullable_floats": [1.0, 2.3, None],
        }
    )

    file_object = get_csv_file_object.run(input_df)

    assert isinstance(file_object, BytesIO)

    df_from_file_object = pd.read_csv(file_object)
    pd.testing.assert_frame_equal(df_from_file_object, input_df)


def test_get_geopackage_file_object_with_layers():

    input_gdf = gpd.GeoDataFrame(
        {
            "ints": [1, 2, 3, 4, 5],
            "strings": ["a", "b", "a", "a", None],
            "floats": [1.0, 2.3, 10.5, 11.2, -6.56],
            "geometry": [
                make_square_multipolygon(0, 0, 10, 10),
                make_square_multipolygon(-10, 45, 180, 5),
                make_square_multipolygon(-110, 60, 10, 10),
                None,
                make_square_multipolygon(-105, 62, 10, 10),
            ],
        }
    )

    layers = "strings"

    file_object = get_geopackage_file_object.run(input_gdf, layers=layers)

    assert isinstance(file_object, BytesIO)

    layer_1, layer_2 = ["a", "b"]
    assert fiona.listlayers(file_object) == [layer_1, layer_2]

    file_object.seek(0)
    gdf_from_file_object = gpd.read_file(file_object, driver="GPKG", layer=layer_1)
    print(gdf_from_file_object.to_markdown(index=False))
    print("*" * 88)
    pd.testing.assert_frame_equal(
        gdf_from_file_object,
        input_gdf[input_gdf[layers] == layer_1].reset_index(drop=True),
    )

    file_object.seek(0)
    gdf_from_file_object = gpd.read_file(file_object, driver="GPKG", layer=layer_2)
    print(gdf_from_file_object.to_markdown(index=False))
    pd.testing.assert_frame_equal(
        gdf_from_file_object,
        input_gdf[input_gdf[layers] == layer_2].reset_index(drop=True),
    )
