from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd
import pytest
from dateutil.relativedelta import relativedelta
from jinja2 import Template

from config import TEST_DATA_LOCATION
from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment
from src.pipeline.entities.pnos import PnoToRender, PreRenderedPno
from src.pipeline.flows.distribute_pnos import (
    extract_fishing_gear_names,
    extract_pnos_to_distribute,
    extract_species_names,
    flow,
    get_template,
    pre_render_pno,
    print_html_to_pdf,
    render_pno,
    to_pnos_to_render,
)
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def species_names() -> dict:
    return {
        "BFT": "(Capitaine) Haddock",
        "GHL": "Pou Hasse Caille",
        "SWO": "Friture sur la ligne",
    }


@pytest.fixture
def fishing_gear_names() -> dict:
    return {
        "DRB": "Dragues remorquées par bateau",
        "GNS": "Filets maillants calés (ancrés)",
        "GTR": "Trémails",
        "LLS": "Palangres calées",
        "OTB": "Chaluts de fond à panneaux",
        "OTM": "Chaluts pélagiques à panneaux",
        "OTT": "Chaluts jumeaux à panneaux",
        "PS": "Sennes coulissantes",
        "PS1": "Sennes coulissantes manœuvrées par un navire",
    }


@pytest.fixture
def extracted_pnos() -> pd.DataFrame:
    now = datetime.utcnow()
    return pd.DataFrame(
        {
            "id": [35, 36, 37, 38, 39],
            "operation_number": ["11", "12", "13", "14", "15"],
            "operation_datetime_utc": [
                now - relativedelta(months=1, hours=1),
                now - relativedelta(months=1, minutes=25),
                now - relativedelta(months=1, hours=2),
                now - relativedelta(months=1, minutes=52),
                now - relativedelta(months=1, minutes=32),
            ],
            "operation_type": ["DAT", "DAT", "DAT", "DAT", "DAT"],
            "report_id": ["11", "12", "13", "14", "15"],
            "report_datetime_utc": [
                now - relativedelta(months=1, hours=1, minutes=2),
                now - relativedelta(months=1, minutes=27),
                now - relativedelta(months=1, hours=2, minutes=2),
                now - relativedelta(months=1, minutes=54),
                now - relativedelta(months=1, minutes=34),
            ],
            "cfr": [
                "ABC000542519",
                "ABC000000000",
                "ABC000306959",
                "ABC000306959",
                "___TARGET___",
            ],
            "ircs": ["FQ7058", "ABCD", "LLUK", "LLUK", "TRGT"],
            "external_identification": [
                "RO237719",
                "LEB@T0",
                "RV348407",
                "RV348407",
                "TARGET",
            ],
            "vessel_name": [
                "DEVINER FIGURE CONSCIENCE",
                "CAPITAINE HADDOCK",
                "ÉTABLIR IMPRESSION LORSQUE",
                "ÉTABLIR IMPRESSION LORSQUE",
                "NAVIRE CIBLE",
            ],
            "flag_state": ["FRA", "POL", "FRA", "FRA", "FRA"],
            "purpose": ["LAN", "ACS", "OTH", "LAN", "LAN"],
            "catch_onboard": [
                [
                    {
                        "nbFish": None,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "GHL",
                        "statisticalRectangle": "47E3",
                    },
                    {
                        "nbFish": None,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "GHL",
                        "statisticalRectangle": "47E4",
                    },
                    {"unexpected_field": "All other field are missing"},
                    {
                        "nbFish": None,
                        "weight": 1450.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                        "statisticalRectangle": "47E3",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "BFT",
                        "statisticalRectangle": "47E3",
                    },
                    {
                        "nbFish": 2,
                        "weight": 70.0,
                        "faoZone": "27.8.a",
                        "species": "SWO",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.b",
                        "species": "BFT",
                        "statisticalRectangle": "47E6",
                    },
                    {
                        "nbFish": None,
                        "weight": 250.0,
                        "faoZone": "27.8.b",
                        "species": "GHL",
                        "statisticalRectangle": "47E4",
                    },
                ],
                None,
                [
                    {
                        "nbFish": None,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "GHL",
                    },
                    {
                        "nbFish": None,
                        "weight": 1450.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "BFT",
                    },
                    {
                        "nbFish": 2,
                        "weight": 70.0,
                        "faoZone": "27.8.a",
                        "species": "SWO",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.b",
                        "species": "BFT",
                    },
                    {
                        "nbFish": None,
                        "weight": 250.0,
                        "faoZone": "27.8.b",
                        "species": "GHL",
                    },
                ],
                [
                    {
                        "nbFish": None,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "GHL",
                    },
                    {
                        "nbFish": None,
                        "weight": 1450.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "BFT",
                    },
                    {
                        "nbFish": 2,
                        "weight": 70.0,
                        "faoZone": "27.8.a",
                        "species": "SWO",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.b",
                        "species": "BFT",
                    },
                    {
                        "nbFish": None,
                        "weight": 250.0,
                        "faoZone": "27.8.b",
                        "species": "GHL",
                    },
                ],
                [
                    {
                        "nbFish": None,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "GHL",
                    },
                    {
                        "nbFish": None,
                        "weight": 1450.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.a",
                        "species": "BFT",
                    },
                    {
                        "nbFish": 2,
                        "weight": 70.0,
                        "faoZone": "27.8.a",
                        "species": "SWO",
                    },
                    {
                        "nbFish": 2,
                        "weight": 150.0,
                        "faoZone": "27.8.b",
                        "species": "BFT",
                    },
                    {
                        "nbFish": None,
                        "weight": 250.0,
                        "faoZone": "27.8.b",
                        "species": "GHL",
                    },
                ],
            ],
            "port_locode": ["FRCQF", "FRZJZ", "FRDKK", "FRLEH", "FRDPE"],
            "port_name": [
                "Somewhere over the rainbow",
                "Somewhere over the top",
                "Somewhere over the swell",
                "Somewhere over the ocean",
                "Somewhere over the clouds",
            ],
            "predicted_arrival_datetime_utc": [
                datetime(2020, 5, 6, 11, 41, 3, 340000),
                datetime(2020, 5, 6, 11, 41, 3, 340000),
                datetime(2020, 5, 6, 11, 41, 3, 340000),
                datetime(2020, 5, 6, 11, 41, 3, 340000),
                datetime(2020, 5, 6, 11, 41, 3, 340000),
            ],
            "predicted_landing_datetime_utc": [
                datetime(2020, 5, 6, 16, 40, 0, 0),
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
            ],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                ],
                [],
                [{"gear": "OTT", "mesh": 140, "dimensions": "250.0"}],
                [{"gear": "OTB", "mesh": 140, "dimensions": "250.0"}],
                [{"gear": "OTB", "mesh": 140, "dimensions": "250.0"}],
            ],
            "trip_segments": [
                [
                    {"segment": "SHKE27", "segmentName": "Merlu en zone 27"},
                    {"segment": "SOTM", "segmentName": "Chaluts pélagiques"},
                ],
                [],
                [{"segment": "SOTM", "segmentName": "Chaluts pélagiques"}],
                [
                    {
                        "segment": "SWW01/02/03",
                        "segmentName": "Segment ciblé par une unité",
                    }
                ],
                [],
            ],
            "pno_types": [
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "hasDesignatedPorts": False,
                        "minimumNotificationPeriod": 4.0,
                    },
                ],
                [],
                [
                    {
                        "pnoTypeName": "Préavis type 2",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    }
                ],
                [
                    {
                        "pnoTypeName": "Préavis type 1",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    },
                    {
                        "pnoTypeName": "Préavis type 2",
                        "hasDesignatedPorts": True,
                        "minimumNotificationPeriod": 4.0,
                    },
                ],
                [],
            ],
            "vessel_length": [13.4, None, 17.4, 17.4, None],
            "mmsi": [None, None, None, None, None],
            "risk_factor": [
                2.09885592141872,
                None,
                2.14443662414848,
                2.14443662414848,
                None,
            ],
            "last_control_datetime_utc": [
                now - relativedelta(years=1, days=2),
                pd.NaT,
                now - relativedelta(months=6, days=6, hours=6),
                now - relativedelta(months=6, days=6, hours=6),
                pd.NaT,
            ],
        }
    )


@pytest.fixture
def pno_to_render_1() -> PnoToRender:
    return PnoToRender(
        id=35,
        operation_number="11",
        operation_datetime_utc=datetime(2024, 5, 5, 8, 13, 38, 259967),
        operation_type="DAT",
        report_id="11",
        report_datetime_utc=datetime(2024, 5, 5, 8, 11, 38, 259967),
        cfr="ABC000542519",
        ircs="FQ7058",
        external_identification="RO237719",
        vessel_name="DEVINER FIGURE CONSCIENCE",
        flag_state="FRA",
        purpose="LAN",
        catch_onboard=[
            {
                "nbFish": None,
                "weight": 150.0,
                "faoZone": "27.8.a",
                "species": "GHL",
                "statisticalRectangle": "47E3",
            },
            {
                "nbFish": None,
                "weight": 150.0,
                "faoZone": "27.8.a",
                "species": "GHL",
                "statisticalRectangle": "47E4",
            },
            {"unexpected_field": "All other field are missing"},
            {
                "nbFish": None,
                "weight": 1450.0,
                "faoZone": "27.8.a",
                "species": "HKE",
                "statisticalRectangle": "47E3",
            },
            {
                "nbFish": 2,
                "weight": 150.0,
                "faoZone": "27.8.a",
                "species": "BFT",
                "statisticalRectangle": "47E3",
            },
            {"nbFish": 2, "weight": 70.0, "faoZone": "27.8.a", "species": "SWO"},
            {
                "nbFish": 2,
                "weight": 150.0,
                "species": "BFT",
                "statisticalRectangle": "47E6",
            },
            {
                "nbFish": None,
                "weight": 250.0,
                "faoZone": "27.8.b",
                "species": "GHL",
                "statisticalRectangle": "47E4",
            },
            {"nbFish": 2, "weight": 955.0, "species": "ABC"},
        ],
        port_locode="FRCQF",
        port_name="Somewhere over the rainbow",
        predicted_arrival_datetime_utc=datetime(2020, 5, 6, 11, 41, 3, 340000),
        predicted_landing_datetime_utc=datetime(2020, 5, 6, 16, 40),
        trip_gears=[
            {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
            {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
        ],
        trip_segments=[
            {"segment": "SHKE27", "segmentName": "Merlu en zone 27"},
            {"segment": "SOTM", "segmentName": "Chaluts pélagiques"},
        ],
        pno_types=[
            {
                "pnoTypeName": "Préavis type 1",
                "hasDesignatedPorts": True,
                "minimumNotificationPeriod": 4.0,
            },
            {
                "pnoTypeName": "Préavis type 2",
                "hasDesignatedPorts": False,
                "minimumNotificationPeriod": 4.0,
            },
        ],
        vessel_length=13.4,
        mmsi=None,
        risk_factor=2.09885592141872,
        last_control_datetime_utc=datetime(2023, 6, 3, 9, 13, 38, 259967),
    )


@pytest.fixture
def pre_rendered_pno_1_catch_onboard() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "Espèces": [
                "- (HKE)",
                "- (ABC)",
                "Pou Hasse Caille (GHL)",
                "(Capitaine) Haddock (BFT)",
                "Friture sur la ligne (SWO)",
            ],
            "Zones de pêche": [
                "27.8.a (47E3)",
                "-",
                "27.8.a (47E3, 47E4), 27.8.b (47E4)",
                "- (47E6), 27.8.a (47E3)",
                "27.8.a",
            ],
            "Qtés (kg)": [1450, 955, 550, 300, 70],
            "Nb": ["-", 2, "-", 4, 2],
        }
    )


@pytest.fixture
def pre_rendered_pno_1(pre_rendered_pno_1_catch_onboard) -> PreRenderedPno:
    return PreRenderedPno(
        id=35,
        operation_number="11",
        operation_datetime_utc=datetime(2024, 5, 5, 8, 13, 38, 259967),
        operation_type="DAT",
        report_id="11",
        report_datetime_utc=datetime(2024, 5, 5, 8, 11, 38, 259967),
        cfr="ABC000542519",
        ircs="FQ7058",
        external_identification="RO237719",
        vessel_name="DEVINER FIGURE CONSCIENCE",
        flag_state="FRA",
        purpose="Débarquement",
        catch_onboard=pre_rendered_pno_1_catch_onboard,
        port_locode="FRCQF",
        port_name="Somewhere over the rainbow",
        predicted_arrival_datetime_utc=datetime(2020, 5, 6, 11, 41, 3, 340000),
        predicted_landing_datetime_utc=datetime(2020, 5, 6, 16, 40),
        trip_gears=[
            FishingGear(code="OTT", name="Chaluts jumeaux à panneaux", mesh=140),
            FishingGear(code="OTT", name="Chaluts jumeaux à panneaux", mesh=120),
        ],
        trip_segments=[
            FleetSegment(code="SHKE27", name="Merlu en zone 27"),
            FleetSegment(code="SOTM", name="Chaluts pélagiques"),
        ],
        pno_types=["Préavis type 1", "Préavis type 2"],
        vessel_length=13.4,
        mmsi=None,
        risk_factor=2.09885592141872,
        last_control_datetime_utc=datetime(2023, 6, 3, 9, 13, 38, 259967),
    )


@pytest.fixture
def pno_to_render_2() -> PnoToRender:
    return PnoToRender(
        id=36,
        operation_number="12",
        operation_datetime_utc=datetime(2024, 5, 5, 8, 48, 38, 259967),
        operation_type="DAT",
        report_id="12",
        report_datetime_utc=datetime(2024, 5, 5, 8, 46, 38, 259967),
        cfr="ABC000000000",
        ircs="ABCD",
        external_identification="LEB@T0",
        vessel_name="CAPITAINE HADDOCK",
        flag_state="POL",
        purpose="ACS",
        catch_onboard=None,
        port_locode="FRZJZ",
        port_name="Somewhere over the top",
        predicted_arrival_datetime_utc=datetime(2020, 5, 6, 11, 41, 3, 340000),
        predicted_landing_datetime_utc=pd.NaT,
        trip_gears=[],
        trip_segments=[],
        pno_types=[],
        vessel_length=np.nan,
        mmsi=None,
        risk_factor=np.nan,
        last_control_datetime_utc=pd.NaT,
    )


def test_get_template():
    template = get_template.run()
    assert isinstance(template, Template)


@pytest.fixture
def template() -> dict:
    return get_template.run()


def test_extract_pnos_to_distribute(reset_test_data, extracted_pnos):
    approximate_datetime_columns = [
        "operation_datetime_utc",
        "report_datetime_utc",
        "last_control_datetime_utc",
    ]

    pnos = extract_pnos_to_distribute.run(
        start_datetime_utc=datetime(2020, 1, 1),
        end_datetime_utc=datetime.now(tz=timezone.utc).replace(tzinfo=None),
    )

    pd.testing.assert_frame_equal(
        pnos.drop(columns=approximate_datetime_columns),
        extracted_pnos.drop(columns=approximate_datetime_columns),
    )

    for col in approximate_datetime_columns:
        assert (
            (pnos[col].dropna() - extracted_pnos[col].dropna()).abs()
            < timedelta(seconds=10)
        ).all()


def test_extract_species_names(reset_test_data, species_names):
    res = extract_species_names.run()
    assert res == species_names


def test_extract_fishing_gear_names(reset_test_data, fishing_gear_names):
    res = extract_fishing_gear_names.run()
    assert res == fishing_gear_names


def test_to_pnos_to_render(extracted_pnos):
    res = to_pnos_to_render.run(pnos=extracted_pnos)
    assert len(res) == 5
    assert isinstance(res[0], PnoToRender)


def test_pre_render_pno_1(
    pno_to_render_1, species_names, fishing_gear_names, pre_rendered_pno_1
):
    res = pre_render_pno.run(
        pno=pno_to_render_1,
        species_names=species_names,
        fishing_gear_names=fishing_gear_names,
    )
    PreRenderedPno.assertEqual(res, pre_rendered_pno_1)


# @patch("src.pipeline.flows.distribute_pnos.EMAIL_FONTS_LOCATION", "/somewhere")
# @patch("src.pipeline.flows.distribute_pnos.CNSP_LOGO_PATH", "/somewhere")
def test_render_pno_1(pre_rendered_pno_1, template):
    res = render_pno.run(pno=pre_rendered_pno_1, template=template)

    test_filepath = TEST_DATA_LOCATION / "emails/prior_notifications/pno_1.html"

    ######################### Uncomment to replace test files #########################
    with open(test_filepath, "w") as f:
        f.write(res)
    ###################################################################################


def test_print_html_to_pdf():
    test_filepath = TEST_DATA_LOCATION / "emails/prior_notifications/pno_1.html"

    ######################### Uncomment to replace test files #########################
    with open(test_filepath, "r") as f:
        html = f.read()
    pdf = print_html_to_pdf.run(html)

    pdf_test_filepath = TEST_DATA_LOCATION / "emails/prior_notifications/pno_1.pdf"

    ######################### Uncomment to replace test files #########################
    with open(pdf_test_filepath, "wb") as f:
        f.write(pdf)


# def test_flow(reset_test_data):
#     flow.schedule = None
#     state = flow.run()

#     assert state.is_successful()
