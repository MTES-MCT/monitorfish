import re
from io import BytesIO
from unittest.mock import patch

import geopandas as gpd
import pandas as pd
import pytest

from src.flows.regulations_open_data import (
    extract_regulations_open_data,
    get_regulations_for_geopackage,
    get_regulations_for_geoplateforme_csv,
    get_regulations_for_open_data_csv,
    regulations_open_data_flow,
)
from tests.test_utils import make_square_multipolygon

TYPES_DE_REGLEMENTATION = [
    "Reg. Facade 1",
    "Reg. Facade 1",
    "Reg. Facade 2",
    "Reg. Facade 2",
    "Reg. Facade 2",
    "Reg. RTC",
]

THEMATIQUES = [
    "Morbihan - bivalves",
    "Morbihan - bivalves",
    "Mediterranée - filets",
    "Mediterranée - filets",
    "Mediterranée - filets",
    "Zone RTC DNK",
]

ZONES = ["Secteur 1", "Secteur 2", "Zone A", "Zone B", "Zone C", "Zone RTC"]

LISTE_REGLEMENTATIONS = [
    "External regulation",
    "some regulation, some other regulation",
    None,
    "Med regulation",
    "Dead link regulation",
    None,
]

REGLEMENTATIONS = [
    (
        '[{"url": "http://external.site.regulation", "endDate": '
        '"2017-07-14T02:40:00.000Z", "reference": "External regulation"}]'
    ),
    (
        '[{"url": "http://legipeche.metier.e2.rie.gouv.fr/some-regulation-a666.html'
        '?var=12", "endDate": 123456789, "reference": "some regulation"}, '
        '{"url": "http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html"'
        ', "endDate": "infinite", "reference": "some other regulation"}]'
    ),
    None,
    (
        '[{"url": "http://legipeche.metier.e2.rie.gouv.fr/regulation-a689.html", '
        '"endDate": "2030-03-17T17:46:40.000Z", "reference": "Med regulation"}]'
    ),
    (
        '[{"url": "http://legipeche.metier.e2.rie.gouv.fr/deleted-regulation-a671.html"'
        ', "reference": "Dead link regulation"}]'
    ),
    None,
]

PERIODES = ['{"always": true}', None, None, None, None, None]

ENGINS = ['{"authorized": []}', None, None, None, None, None]

ESPECES = ['{"authorized": []}', None, None, None, None, None]

REMARQUES_GENERALES = ["Some other info", None, None, None, None, None]

WKTS = [
    "MULTIPOLYGON(((0 0,10 0,10 10,0 10,0 0)))",
    "MULTIPOLYGON(((120 -20,135 -20,135 -10,120 -10,120 -20)))",
    "MULTIPOLYGON(((-60 10,-55 10,-55 20,-60 20,-60 10)))",
    "MULTIPOLYGON(((-10 45,170 45,170 50,-10 50,-10 45)))",
    "MULTIPOLYGON(((-110 60,-100 60,-100 70,-110 70,-110 60)))",
    "MULTIPOLYGON(((-1 49,0 49,0 50,-1 50,-1 49)))",
]

GEOMETRIES = [
    make_square_multipolygon(0, 0, 10, 10),
    make_square_multipolygon(120, -20, 15, 10),
    make_square_multipolygon(-60, 10, 5, 10),
    make_square_multipolygon(-10, 45, 180, 5),
    make_square_multipolygon(-110, 60, 10, 10),
    make_square_multipolygon(-1, 49, 1, 1),
]


@pytest.fixture
def regulations_open_data() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {
            "type_de_reglementation": TYPES_DE_REGLEMENTATION,
            "thematique": THEMATIQUES,
            "zone": ZONES,
            "periodes": PERIODES,
            "engins": ENGINS,
            "especes": ESPECES,
            "remarques_generales": REMARQUES_GENERALES,
            "reglementations": REGLEMENTATIONS,
            "liste_reglementations": LISTE_REGLEMENTATIONS,
            "geometry": GEOMETRIES,
            "wkt": WKTS,
        }
    )


@pytest.fixture
def regulations_for_open_data_csv() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "type_de_reglementation": TYPES_DE_REGLEMENTATION,
            "thematique": THEMATIQUES,
            "zone": ZONES,
            "liste_reglementations": LISTE_REGLEMENTATIONS,
            "wkt": WKTS,
        }
    )


@pytest.fixture
def regulations_for_geoplateforme_csv() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "type_de_reglementation": TYPES_DE_REGLEMENTATION,
            "thematique": THEMATIQUES,
            "zone": ZONES,
            "periodes": PERIODES,
            "engins": ENGINS,
            "especes": ESPECES,
            "remarques_generales": REMARQUES_GENERALES,
            "reglementations": REGLEMENTATIONS,
            "wkt": WKTS,
        }
    )


@pytest.fixture
def regulations_for_geopackage() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame(
        {
            "type_de_reglementation": TYPES_DE_REGLEMENTATION,
            "thematique": THEMATIQUES,
            "zone": ZONES,
            "reglementations": LISTE_REGLEMENTATIONS,
            "geometry": GEOMETRIES,
        }
    )


def test_extract_regulations_open_data(reset_test_data, regulations_open_data):
    regulations = extract_regulations_open_data()
    pd.testing.assert_frame_equal(regulations, regulations_open_data)


def test_get_regulations_for_open_data_csv(
    regulations_open_data, regulations_for_open_data_csv
):
    regulations = get_regulations_for_open_data_csv(regulations_open_data)
    pd.testing.assert_frame_equal(regulations, regulations_for_open_data_csv)


def test_get_regulations_for_geoplateforme_csv(
    regulations_open_data, regulations_for_geoplateforme_csv
):
    regulations = get_regulations_for_geoplateforme_csv(regulations_open_data)
    pd.testing.assert_frame_equal(regulations, regulations_for_geoplateforme_csv)


def test_get_regulations_for_geopackage(
    regulations_open_data, regulations_for_geopackage
):
    regulations = get_regulations_for_geopackage(regulations_open_data)
    pd.testing.assert_frame_equal(regulations, regulations_for_geopackage)


@patch("src.flows.regulations_open_data.delete_data_store_stored_data")
@patch("src.flows.regulations_open_data.swap_configuration_stored_data")
@patch("src.flows.regulations_open_data.run_data_store_workflow")
@patch("src.flows.regulations_open_data.deliver_to_data_store")
@patch("src.flows.regulations_open_data.update_resource")
def test_flow(
    mock_update_resource,
    mock_deliver_to_data_store,
    mock_run_data_store_workflow,
    mock_swap_configuration_stored_data,
    mock_delete_data_store_stored_data,
    reset_test_data,
    regulations_for_open_data_csv,
    regulations_for_geoplateforme_csv,
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
        df_from_csv_file_object.convert_dtypes(),
        regulations_for_open_data_csv.convert_dtypes(),
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

    # Check the Géoplateforme delivery
    mock_deliver_to_data_store.assert_called_once()
    delivery_kwargs = mock_deliver_to_data_store.call_args.kwargs
    delivered_files = delivery_kwargs.pop("files")
    assert delivery_kwargs == {
        "upload_name": "reglementation_des_peches_cartographiee",
        "description": "Réglementation des pêches cartographiée",
        "srs": "EPSG:4326",
        "tags": {"source": "monitorfish"},
        "comments": None,
        "mock_update": False,
    }

    [(delivered_file_name, delivered_file_object)] = delivered_files.items()
    assert delivered_file_name == "reglementation_des_peches_cartographiee.csv"
    assert isinstance(delivered_file_object, BytesIO)
    pd.testing.assert_frame_equal(
        pd.read_csv(delivered_file_object).convert_dtypes(),
        regulations_for_geoplateforme_csv.convert_dtypes(),
    )

    # Check the Géoplateforme workflow run
    mock_run_data_store_workflow.assert_called_once()
    workflow_kwargs = mock_run_data_store_workflow.call_args.kwargs
    assert workflow_kwargs["step"] == "creation-base"
    assert (
        workflow_kwargs["workflow_file"].name == "regulations_workflow.jsonc"
    ), workflow_kwargs["workflow_file"]
    assert workflow_kwargs["workflow_file"].exists()
    params = workflow_kwargs["params"]
    assert params["upload_name"] == "reglementation_des_peches_cartographiee"
    assert params["datasheet_name"] == "regulation-int"
    assert params["producer"] == "MonitorFish"
    assert params["production_year"].isdigit()
    # A new stored data is created at each run, suffixed with the run date.
    stored_data_name = params["stored_data_name"]
    assert re.fullmatch(
        r"reglementation_des_peches_cartographiee_\d{8}T\d{6}", stored_data_name
    ), stored_data_name
    assert workflow_kwargs["mock_update"] is False

    # The geoservice is pointed at the stored data just created, then the previous one
    # is deleted, so that the published data never accumulates.
    mock_swap_configuration_stored_data.assert_called_once_with(
        configuration_id="geoplateforme_configuration_id",
        offering_id="geoplateforme_offering_id",
        stored_data_name=stored_data_name,
        mock_update=False,
    )
    mock_delete_data_store_stored_data.assert_called_once_with(
        stored_data_id=mock_swap_configuration_stored_data.return_value,
        mock_update=False,
    )
