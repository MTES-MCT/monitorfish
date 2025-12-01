from io import BytesIO
from unittest.mock import patch

import geopandas as gpd
import pandas as pd
import pytest

from src.flows.regulations_open_data import (
    extract_regulations_open_data,
    get_regulations_for_csv,
    get_regulations_for_geopackage,
    regulations_open_data_flow,
)

# from tests.mocks import mock_update_resource
from tests.test_shared_tasks.test_datagouv import make_square_multipolygon


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
                "Reg. RTC",
            ],
            "thematique": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Zone RTC DNK",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
                "Zone RTC",
            ],
            "reglementations": [
                "External regulation",
                "some regulation, some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
                None,
            ],
            "geometry": [
                make_square_multipolygon(0, 0, 10, 10),
                make_square_multipolygon(120, -20, 15, 10),
                make_square_multipolygon(-60, 10, 5, 10),
                make_square_multipolygon(-10, 45, 180, 5),
                make_square_multipolygon(-110, 60, 10, 10),
                make_square_multipolygon(-1, 49, 1, 1),
            ],
            "wkt": [
                "MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)))",
                "MULTIPOLYGON(((120 -20,135 -20,135 -10,120 -10,120 -20)))",
                "MULTIPOLYGON(((-60 10,-55 10,-55 20,-60 20,-60 10)))",
                "MULTIPOLYGON(((-10 45,170 45,170 50,-10 50,-10 45)))",
                "MULTIPOLYGON(((-110 60,-100 60,-100 70,-110 70,-110 60)))",
                "MULTIPOLYGON(((-1 49,0 49,0 50,-1 50,-1 49)))",
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
                "Reg. RTC",
            ],
            "thematique": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Zone RTC DNK",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
                "Zone RTC",
            ],
            "reglementations": [
                "External regulation",
                "some regulation, some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
                None,
            ],
            "wkt": [
                "MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)))",
                "MULTIPOLYGON(((120 -20,135 -20,135 -10,120 -10,120 -20)))",
                "MULTIPOLYGON(((-60 10,-55 10,-55 20,-60 20,-60 10)))",
                "MULTIPOLYGON(((-10 45,170 45,170 50,-10 50,-10 45)))",
                "MULTIPOLYGON(((-110 60,-100 60,-100 70,-110 70,-110 60)))",
                "MULTIPOLYGON(((-1 49,0 49,0 50,-1 50,-1 49)))",
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
                "Reg. RTC",
            ],
            "thematique": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Zone RTC DNK",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
                "Zone RTC",
            ],
            "reglementations": [
                "External regulation",
                "some regulation, some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
                None,
            ],
            "geometry": [
                make_square_multipolygon(0, 0, 10, 10),
                make_square_multipolygon(120, -20, 15, 10),
                make_square_multipolygon(-60, 10, 5, 10),
                make_square_multipolygon(-10, 45, 180, 5),
                make_square_multipolygon(-110, 60, 10, 10),
                make_square_multipolygon(-1, 49, 1, 1),
            ],
        }
    )


def test_extract_regulations_open_data(reset_test_data, regulations_open_data):
    regulations = extract_regulations_open_data()
    pd.testing.assert_frame_equal(regulations, regulations_open_data)


def test_get_regulations_for_csv(regulations_open_data, regulations_for_csv):
    regulations = get_regulations_for_csv(regulations_open_data)
    pd.testing.assert_frame_equal(regulations, regulations_for_csv)


def test_get_regulations_for_geopackage(
    regulations_open_data, regulations_for_geopackage
):
    regulations = get_regulations_for_geopackage(regulations_open_data)
    pd.testing.assert_frame_equal(regulations, regulations_for_geopackage)


@patch("src.flows.regulations_open_data.update_resource")
def test_flow(
    mock_update_resource,
    reset_test_data,
    regulations_for_csv,
    regulations_for_geopackage,
):
    state = regulations_open_data_flow(return_state=True)
    assert state.is_completed()
    assert mock_update_resource.call_count == 2
    [call1, call2] = mock_update_resource.call_args_list

    # Check csv file object
    csv_file_object = call1.kwargs.pop("resource")
    assert call1.kwargs == {
        "dataset_id": "60c0ad5b8d17ba18c7b17bd0",
        "resource_id": "67578d0c-92d4-44b4-8405-34ade40742aa",
        "resource_title": "reglementation-des-peches-cartographiee.csv",
        "mock_update": False,
    }
    assert isinstance(csv_file_object, BytesIO)
    df_from_csv_file_object = pd.read_csv(csv_file_object)
    pd.testing.assert_frame_equal(
        df_from_csv_file_object.convert_dtypes(), regulations_for_csv.convert_dtypes()
    )

    # Check geopackage file object
    geopackage_file_object = call2.kwargs.pop("resource")
    assert call2.kwargs == {
        "dataset_id": "60c0ad5b8d17ba18c7b17bd0",
        "resource_id": "12d32a68-e245-4e19-9215-7d07c699b6c0",
        "resource_title": "reglementation-des-peches-cartographiee.gpkg",
        "mock_update": False,
    }

    assert isinstance(geopackage_file_object, BytesIO)
    layers = ["Reg. Facade 1", "Reg. Facade 2", "Reg. RTC"]
    gdfs = []
    for layer in layers:
        geopackage_file_object.seek(0)
        gdfs.append(gpd.read_file(geopackage_file_object, driver="GPKG", layer=layer))

    gdf_from_geopackage_file_object = pd.concat(gdfs).reset_index(drop=True)

    pd.testing.assert_frame_equal(
        gdf_from_geopackage_file_object, regulations_for_geopackage
    )
