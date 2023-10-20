from io import BytesIO

import geopandas as gpd
import pandas as pd
import pytest

from src.pipeline.flows.regulations_open_data import (
    extract_regulations_open_data,
    flow,
    get_regulations_for_csv,
    get_regulations_for_geopackage,
)
from tests.mocks import mock_check_flow_not_running, mock_update_resource
from tests.test_pipeline.test_shared_tasks.test_datagouv import make_square_multipolygon

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


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


def test_flow(reset_test_data, regulations_for_csv, regulations_for_geopackage):
    while flow.get_tasks("update_resource"):
        flow.replace(flow.get_tasks("update_resource")[0], mock_update_resource)

    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    # Check csv file object
    csv_file_object = state.result[flow.get_tasks("get_csv_file_object")[0]].result
    assert isinstance(csv_file_object, BytesIO)
    df_from_csv_file_object = pd.read_csv(csv_file_object)
    pd.testing.assert_frame_equal(
        df_from_csv_file_object.convert_dtypes(), regulations_for_csv.convert_dtypes()
    )

    # Check geopackage file object
    geopackage_file_object = state.result[
        flow.get_tasks("get_geopackage_file_object")[0]
    ].result
    assert isinstance(geopackage_file_object, BytesIO)

    layers = ["Reg. Facade 1", "Reg. Facade 2"]
    gdfs = []
    for layer in layers:
        geopackage_file_object.seek(0)
        gdfs.append(gpd.read_file(geopackage_file_object, driver="GPKG", layer=layer))

    gdf_from_geopackage_file_object = pd.concat(gdfs).reset_index(drop=True)

    pd.testing.assert_frame_equal(
        gdf_from_geopackage_file_object, regulations_for_geopackage
    )
