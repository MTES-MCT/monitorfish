from io import BytesIO
from unittest.mock import patch

import fiona
import geopandas as gpd
import pandas as pd
import pytest
import requests
from prefect import task
from shapely.geometry import MultiPolygon

from src.pipeline.flows.regulations_open_data import (
    extract_regulations_open_data,
    flow,
    get_csv_file_object,
    get_geopackage_file_object,
    get_regulations_for_csv,
    get_regulations_for_geopackage,
)
from src.pipeline.shared_tasks.datagouv import update_resource
from tests.mocks import mock_check_flow_not_running


@task(checkpoint=False)
def mock_update_resource(
    dataset_id: str, resource_id: str, resource_title: str, resource: BytesIO
) -> pd.DataFrame:
    def return_200(url, **kwargs):
        r = requests.Response()
        r.status_code = 200
        r.url = url
        return r

    with patch("src.pipeline.shared_tasks.datagouv.requests.post", return_200):
        return update_resource.run(
            dataset_id=dataset_id,
            resource_id=resource_id,
            resource_title=resource_title,
            resource=resource,
        )


flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


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


@pytest.fixture
def regulations_open_data() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {
            "type_de_reglementation": [
                "Reg. Facade 1",
                "Reg. Facade 1",
                "Reg. Facade 2",
                "Reg. Facade 2",
                "Reg. Facade 2",
            ],
            "thematique": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
            ],
            "reglementations": [
                "External regulation",
                "some regulation, some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
            ],
            "geometry": [
                make_square_multipolygon(0, 0, 10, 10),
                make_square_multipolygon(120, -20, 15, 10),
                make_square_multipolygon(-60, 10, 5, 10),
                make_square_multipolygon(-10, 45, 180, 5),
                make_square_multipolygon(-110, 60, 10, 10),
            ],
            "wkt": [
                "MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)))",
                "MULTIPOLYGON(((120 -20,135 -20,135 -10,120 -10,120 -20)))",
                "MULTIPOLYGON(((-60 10,-55 10,-55 20,-60 20,-60 10)))",
                "MULTIPOLYGON(((-10 45,170 45,170 50,-10 50,-10 45)))",
                "MULTIPOLYGON(((-110 60,-100 60,-100 70,-110 70,-110 60)))",
            ],
        }
    )


@pytest.fixture
def regulations_for_csv() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "type_de_reglementation": [
                "Reg. Facade 1",
                "Reg. Facade 1",
                "Reg. Facade 2",
                "Reg. Facade 2",
                "Reg. Facade 2",
            ],
            "thematique": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
            ],
            "reglementations": [
                "External regulation",
                "some regulation, some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
            ],
            "wkt": [
                "MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)))",
                "MULTIPOLYGON(((120 -20,135 -20,135 -10,120 -10,120 -20)))",
                "MULTIPOLYGON(((-60 10,-55 10,-55 20,-60 20,-60 10)))",
                "MULTIPOLYGON(((-10 45,170 45,170 50,-10 50,-10 45)))",
                "MULTIPOLYGON(((-110 60,-100 60,-100 70,-110 70,-110 60)))",
            ],
        }
    )


@pytest.fixture
def regulations_for_geopackage() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {
            "type_de_reglementation": [
                "Reg. Facade 1",
                "Reg. Facade 1",
                "Reg. Facade 2",
                "Reg. Facade 2",
                "Reg. Facade 2",
            ],
            "thematique": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
            ],
            "reglementations": [
                "External regulation",
                "some regulation, some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
            ],
            "geometry": [
                make_square_multipolygon(0, 0, 10, 10),
                make_square_multipolygon(120, -20, 15, 10),
                make_square_multipolygon(-60, 10, 5, 10),
                make_square_multipolygon(-10, 45, 180, 5),
                make_square_multipolygon(-110, 60, 10, 10),
            ],
        }
    )


def test_extract_regulations_open_data(reset_test_data, regulations_open_data):
    regulations = extract_regulations_open_data.run()
    pd.testing.assert_frame_equal(regulations, regulations_open_data)


def test_get_regulations_for_csv(regulations_open_data, regulations_for_csv):
    regulations = get_regulations_for_csv.run(regulations_open_data)
    pd.testing.assert_frame_equal(regulations, regulations_for_csv)


def test_get_regulations_for_geopackage(
    regulations_open_data, regulations_for_geopackage
):
    regulations = get_regulations_for_geopackage.run(regulations_open_data)
    pd.testing.assert_frame_equal(regulations, regulations_for_geopackage)


def test_get_csv_file_object(regulations_for_csv):
    file_object = get_csv_file_object.run(regulations_for_csv)

    assert isinstance(file_object, BytesIO)

    df_from_file_object = pd.read_csv(file_object)
    pd.testing.assert_frame_equal(df_from_file_object, regulations_for_csv)


def test_get_geopackage_file_object(regulations_for_geopackage):
    file_object = get_geopackage_file_object.run(
        regulations_for_geopackage, layers="type_de_reglementation"
    )

    assert isinstance(file_object, BytesIO)

    layer_1, layer_2 = ["Reg. Facade 1", "Reg. Facade 2"]
    assert fiona.listlayers(file_object) == [layer_1, layer_2]

    file_object.seek(0)
    gdf_from_file_object = gpd.read_file(file_object, driver="GPKG", layer=layer_1)
    pd.testing.assert_frame_equal(
        gdf_from_file_object,
        regulations_for_geopackage[
            regulations_for_geopackage["type_de_reglementation"] == layer_1
        ],
    )

    file_object.seek(0)
    gdf_from_file_object = gpd.read_file(file_object, driver="GPKG", layer=layer_2)
    pd.testing.assert_frame_equal(
        gdf_from_file_object,
        (
            regulations_for_geopackage[
                regulations_for_geopackage["type_de_reglementation"] == layer_2
            ].reset_index(drop=True)
        ),
    )


def test_flow(reset_test_data):

    while flow.get_tasks("update_resource"):
        flow.replace(flow.get_tasks("update_resource")[0], mock_update_resource)

    state = flow.run()
    assert state.is_successful()
