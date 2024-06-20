import dataclasses
import io
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pypdf
import pytest
from dateutil.relativedelta import relativedelta
from jinja2 import Template
from requests import Response

from config import TEST_DATA_LOCATION, default_risk_factors
from src.pipeline.entities.fleet_segments import FishingGear, FleetSegment
from src.pipeline.entities.missions import Infraction
from src.pipeline.entities.pnos import (
    PnoSource,
    PnoToRender,
    PreRenderedPno,
    RenderedPno,
)
from src.pipeline.flows.distribute_pnos import (
    attribute_addressees,
    extract_fishing_gear_names,
    extract_pno_units_ports_and_segments_subscriptions,
    extract_pno_units_targeting_vessels,
    extract_pnos_to_generate,
    extract_species_names,
    fetch_control_units_contacts,
    flow,
    get_email_body_template,
    get_html_for_pdf_template,
    get_sms_template,
    load_pno_pdf_documents,
    pre_render_pno,
    render_pno,
    to_pnos_to_render,
)
from src.read_query import read_query
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
            "vessel_id": [2, None, 1, 1, 7],
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
            "vessel_length": [13.4, None, 17.4, 17.4, 8.58],
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
            "last_control_logbook_infractions": [[], [], [], [], []],
            "last_control_gear_infractions": [
                [
                    {
                        "natinf": 27724,
                        "comments": "Infraction engin",
                        "infractionType": "WITHOUT_RECORD",
                    }
                ],
                [],
                [],
                [],
                [],
            ],
            "last_control_species_infractions": [[], [], [], [], []],
            "last_control_other_infractions": [
                [{"natinf": 2606}, {"natinf": 4761}, {"natinf": 22206}],
                [],
                [],
                [],
                [],
            ],
            "is_verified": [True, True, False, False, False],
            "is_being_sent": [True, True, False, True, True],
            "source": ["LOGBOOK", "LOGBOOK", "LOGBOOK", "LOGBOOK", "LOGBOOK"],
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
        vessel_id=2,
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
        last_control_logbook_infractions=[],
        last_control_gear_infractions=[
            {
                "natinf": 27724,
                "comments": "Infraction engin",
                "infractionType": "WITHOUT_RECORD",
            }
        ],
        last_control_species_infractions=[],
        last_control_other_infractions=[
            {"natinf": 2606},
            {"natinf": 4761},
            {"natinf": 22206},
        ],
        is_verified=False,
        is_being_sent=True,
        source=PnoSource.LOGBOOK,
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
        vessel_id=2,
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
        last_control_logbook_infractions=[],
        last_control_gear_infractions=[
            Infraction(natinf=27724, comments="Infraction engin")
        ],
        last_control_species_infractions=[],
        last_control_other_infractions=[
            Infraction(natinf=2606, comments=None),
            Infraction(natinf=4761, comments=None),
            Infraction(natinf=22206, comments=None),
        ],
        is_verified=False,
        is_being_sent=True,
        source=PnoSource.LOGBOOK,
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
        vessel_id=52,
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
        last_control_logbook_infractions=[],
        last_control_gear_infractions=[],
        last_control_species_infractions=[],
        last_control_other_infractions=[],
        is_verified=True,
        is_being_sent=True,
        source=PnoSource.LOGBOOK,
    )


@pytest.fixture
def pre_rendered_pno_2() -> PreRenderedPno:
    return PreRenderedPno(
        id=36,
        operation_number="12",
        operation_datetime_utc=datetime(2024, 5, 5, 8, 48, 38, 259967),
        operation_type="DAT",
        report_id="12",
        report_datetime_utc=datetime(2024, 5, 5, 8, 46, 38, 259967),
        vessel_id=52,
        cfr="ABC000000000",
        ircs="ABCD",
        external_identification="LEB@T0",
        vessel_name="CAPITAINE HADDOCK",
        flag_state="POL",
        purpose="Accès aux services",
        catch_onboard=None,
        port_locode="FRZJZ",
        port_name="Somewhere over the top",
        predicted_arrival_datetime_utc=datetime(2020, 5, 6, 11, 41, 3, 340000),
        predicted_landing_datetime_utc=None,
        trip_gears=[],
        trip_segments=[],
        pno_types=[],
        vessel_length=None,
        mmsi=None,
        risk_factor=default_risk_factors["risk_factor"],
        last_control_datetime_utc=None,
        last_control_logbook_infractions=[],
        last_control_gear_infractions=[],
        last_control_species_infractions=[],
        last_control_other_infractions=[],
        is_verified=True,
        is_being_sent=True,
        source=PnoSource.LOGBOOK,
    )


@pytest.fixture
def pno_pdf_document_to_distribute_targeted_vessel_and_segments() -> RenderedPno:
    return RenderedPno(
        report_id="123-abc",
        vessel_id=4,
        cfr=None,
        is_verified=False,
        is_being_sent=True,
        trip_segments=[
            FleetSegment("NWW01", "Chalutiers"),
            FleetSegment("NWW02", "Autres"),
        ],
        port_locode="FRZJZ",
        source=PnoSource.MANUAL,
        generation_datetime_utc=datetime(2023, 5, 6, 23, 52, 0),
        pdf_document=b"PDF Document",
        control_unit_ids=None,
    )


@pytest.fixture
def pno_pdf_document_to_distribute_receive_all_pnos_from_port() -> RenderedPno:
    return RenderedPno(
        report_id="456-def",
        vessel_id=1,
        cfr="ABC000306959",
        is_verified=False,
        is_being_sent=True,
        trip_segments=[],
        port_locode="FRDPE",
        source=PnoSource.MANUAL,
        generation_datetime_utc=datetime(2023, 6, 6, 23, 50, 0),
        pdf_document=b"PDF Document",
        control_unit_ids=None,
    )


@pytest.fixture
def pno_pdf_document_to_distribute_without_addressees() -> RenderedPno:
    return RenderedPno(
        report_id="456-def",
        vessel_id=1,
        cfr="ABC000306959",
        is_verified=False,
        is_being_sent=True,
        trip_segments=[],
        port_locode="FRDKK",
        source=PnoSource.MANUAL,
        generation_datetime_utc=datetime(2023, 6, 6, 23, 50, 0),
        pdf_document=b"PDF Document",
        control_unit_ids=None,
    )


@pytest.fixture
def pno_pdf_document_to_distribute_verified() -> RenderedPno:
    return RenderedPno(
        report_id="456-def",
        vessel_id=1,
        cfr="ABC000306959",
        is_verified=True,
        is_being_sent=True,
        trip_segments=[],
        port_locode="FRLEH",
        source=PnoSource.MANUAL,
        generation_datetime_utc=datetime(2023, 6, 6, 23, 50, 0),
        pdf_document=b"PDF Document",
        control_unit_ids=None,
    )


@pytest.fixture
def pno_units_targeting_vessels():
    return pd.DataFrame(
        {
            "vessel_id": [2, 4, 7],
            "cfr": ["ABC000542519", None, "___TARGET___"],
            "control_unit_ids_targeting_vessel": [[4], [1, 2], [4]],
        }
    )


@pytest.fixture
def pno_units_ports_and_segments_subscriptions():
    return pd.DataFrame(
        {
            "port_locode": [
                "FRCQF",
                "FRDKK",
                "FRDPE",
                "FRLEH",
                "FRLEH",
                "FRZJZ",
                "FRZJZ",
            ],
            "control_unit_id": [1, 2, 4, 2, 3, 2, 3],
            "receive_all_pnos_from_port": [
                False,
                False,
                True,
                False,
                False,
                False,
                False,
            ],
            "unit_subscribed_segments": [
                ["SWW01/02/03"],
                [],
                [],
                [],
                ["SWW01/02/03", "NWW01"],
                [],
                ["SWW01/02/03", "NWW01"],
            ],
        }
    )


@pytest.fixture
def monitorenv_control_units_api_response() -> list:
    return [
        {
            "id": 1,
            "controlUnitContacts": [],
            "isArchived": False,
            "name": "Unité 1",
            "otherUneededField_1": [1250],
            "otherUneededField_2": None,
        },
        {
            "id": 2,
            "controlUnitContacts": [
                {
                    "id": 559,
                    "controlUnitId": 2,
                    "email": "some.email@control.unit.4",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "otherUneededField_1": [1250],
                    "otherUneededField_2": None,
                    "name": "OFFICE",
                    "phone": "'00 11 22 33 44 55",
                },
                {
                    "id": 556,
                    "controlUnitId": 2,
                    "email": "alternative@email",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HNO",
                    "phone": "11 11 11 11 11",
                },
                {
                    "id": 557,
                    "controlUnitId": 2,
                    "email": "unused_email.adresse@somewhere",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HO",
                    "phone": "xx xx xx xx xx",
                },
            ],
            "isArchived": False,
            "name": "Unité 2",
            "otherUneededField_1": [1250],
            "otherUneededField_2": None,
        },
        {
            "id": 3,
            "controlUnitContacts": [
                {
                    "id": 320,
                    "controlUnitId": 3,
                    "email": "com.email@bla1",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "22 22 22 22 22",
                },
                {
                    "id": 321,
                    "controlUnitId": 3,
                    "email": "com.email@bla2",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "33 33 33 33 33",
                },
                {
                    "id": 322,
                    "controlUnitId": 3,
                    "email": None,
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "UNKNOWN",
                    "phone": "44 44 44 44 44",
                },
            ],
            "isArchived": False,
            "name": "Unité 3",
        },
        {
            "id": 4,
            "controlUnitContacts": [
                {
                    "id": 1182,
                    "controlUnitId": 4,
                    "email": None,
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "PERMANENT_CONTACT_ONBOARD",
                    "phone": "77 77 77 77 77",
                },
                {
                    "id": 1180,
                    "controlUnitId": 4,
                    "email": "--",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "88 88 88 88 88 (HO) / 99 99 99 99 99 (HNO)",
                },
                {
                    "id": 1181,
                    "controlUnitId": 4,
                    "email": "email4@email.com",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "Unité",
                },
            ],
            "isArchived": False,
            "name": "Unité 4",
        },
        {
            "id": 5,
            "controlUnitContacts": [
                {
                    "id": 382,
                    "controlUnitId": 5,
                    "email": "------",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OFFICE",
                    "phone": "0000000000",
                },
                {
                    "id": 381,
                    "controlUnitId": 5,
                    "email": None,
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "ONBOARD_PHONE",
                    "phone": "0000000000",
                },
                {
                    "id": 379,
                    "controlUnitId": 5,
                    "email": "----",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HNO",
                    "phone": "00000000000",
                },
                {
                    "id": 380,
                    "controlUnitId": 5,
                    "email": "--",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER_HO",
                    "phone": "00000000000",
                },
            ],
            "isArchived": False,
            "name": "Unité 5",
        },
        {
            "id": 6,
            "controlUnitContacts": [
                {
                    "id": 631,
                    "controlUnitId": 6,
                    "email": "****",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": True,
                    "name": "UNKNOWN",
                },
                {
                    "id": 1540,
                    "controlUnitId": 6,
                    "email": "-----",
                    "isEmailSubscriptionContact": False,
                    "isSmsSubscriptionContact": False,
                    "name": "OPERATIONAL_CENTER",
                    "phone": None,
                },
                {
                    "id": 1541,
                    "controlUnitId": 6,
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": False,
                    "name": "Référent police",
                    "phone": None,
                },
            ],
            "isArchived": False,
            "name": "Unité 6",
        },
        {
            "id": 7,
            "controlUnitContacts": [
                {
                    "id": 1540,
                    "controlUnitId": 7,
                    "email": "archived.email",
                    "isEmailSubscriptionContact": True,
                    "isSmsSubscriptionContact": True,
                    "name": "OPERATIONAL_CENTER",
                    "phone": "55 55 55 55 55",
                },
            ],
            "isArchived": True,
            "name": "Unité 7 (historique)",
        },
    ]


@pytest.fixture
def control_units_contacts() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "control_unit_id": [2, 3, 4],
            "email": [
                ["alternative@email", "some.email@control.unit.4"],
                [],
                ["email4@email.com"],
            ],
            "phone": [
                ["'00 11 22 33 44 55"],
                ["44 44 44 44 44"],
                [],
            ],
        }
    )


def test_get_html_for_pdf_template():
    html_for_pdf_template = get_html_for_pdf_template.run()
    assert isinstance(html_for_pdf_template, Template)


@pytest.fixture
def html_for_pdf_template() -> dict:
    return get_html_for_pdf_template.run()


def test_get_email_body_template():
    email_body_template = get_email_body_template.run()
    assert isinstance(email_body_template, Template)


@pytest.fixture
def email_body_template() -> dict:
    return get_email_body_template.run()


def test_get_sms_template():
    sms_template = get_sms_template.run()
    assert isinstance(sms_template, Template)


@pytest.fixture
def sms_template() -> dict:
    return get_sms_template.run()


def test_extract_pnos_to_generate(reset_test_data, extracted_pnos):
    approximate_datetime_columns = [
        "operation_datetime_utc",
        "report_datetime_utc",
        "last_control_datetime_utc",
    ]

    pnos = extract_pnos_to_generate.run(
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


def test_extract_pno_units_targeting_vessels(
    reset_test_data, pno_units_targeting_vessels
):
    res = extract_pno_units_targeting_vessels.run()
    pd.testing.assert_frame_equal(res, pno_units_targeting_vessels)


def test_extract_pno_units_ports_and_segments_subscriptions(
    reset_test_data, pno_units_ports_and_segments_subscriptions
):
    res = extract_pno_units_ports_and_segments_subscriptions.run()
    pd.testing.assert_frame_equal(res, pno_units_ports_and_segments_subscriptions)


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


def test_pre_render_pno_2(
    pno_to_render_2, species_names, fishing_gear_names, pre_rendered_pno_2
):
    res = pre_render_pno.run(
        pno=pno_to_render_2,
        species_names=species_names,
        fishing_gear_names=fishing_gear_names,
    )
    PreRenderedPno.assertEqual(res, pre_rendered_pno_2)


@patch(
    "src.pipeline.flows.distribute_pnos.EMAIL_FONTS_LOCATION",
    Path("/email/fonts/location"),
)
@patch("src.pipeline.flows.distribute_pnos.CNSP_LOGO_PATH", Path("/cnsp/logo/path"))
@patch("src.pipeline.flows.distribute_pnos.SE_MER_LOGO_PATH", Path("/se_mer/logo/path"))
@patch(
    "src.pipeline.flows.distribute_pnos.EMAIL_FONTS_LOCATION", Path("/se_mer/logo/path")
)
def test_render_pno_1(
    html_for_pdf_template, pre_rendered_pno_1, email_body_template, sms_template
):
    pno = render_pno.run(
        pno=pre_rendered_pno_1,
        html_for_pdf_template=html_for_pdf_template,
        email_body_template=email_body_template,
        sms_template=sms_template,
    )

    test_sms_filepath = (
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_sms_1.txt"
    )
    test_html_filepath = (
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_pno_1.html"
    )
    test_email_body_file_path = (
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_email_body_1.html"
    )

    ######################### Uncomment to replace test files #########################
    # with open(test_html_filepath, "w") as f:
    #     f.write(pno.html_for_pdf)

    # with open(test_email_body_file_path, "w") as f:
    #     f.write(pno.html_email_body)

    # with open(test_sms_filepath, "w") as f:
    #     f.write(pno.sms_content)

    ###################################################################################
    with open(test_html_filepath, "r") as f:
        expected_html = f.read()

    with open(test_email_body_file_path, "r") as f:
        expected_html_email_body = f.read()

    with open(test_sms_filepath, "r") as f:
        expected_sms_content = f.read()

    assert isinstance(pno, RenderedPno)
    assert pno.html_for_pdf == expected_html
    assert pno.html_email_body == expected_html_email_body
    assert pno.report_id == "11"
    assert pno.source == PnoSource.LOGBOOK
    assert pno.sms_content == expected_sms_content


@patch(
    "src.pipeline.flows.distribute_pnos.EMAIL_FONTS_LOCATION",
    Path("/email/fonts/location"),
)
@patch("src.pipeline.flows.distribute_pnos.CNSP_LOGO_PATH", Path("/cnsp/logo/path"))
@patch("src.pipeline.flows.distribute_pnos.SE_MER_LOGO_PATH", Path("/se_mer/logo/path"))
@patch(
    "src.pipeline.flows.distribute_pnos.EMAIL_FONTS_LOCATION", Path("/se_mer/logo/path")
)
def test_render_pno_2(
    html_for_pdf_template, pre_rendered_pno_2, email_body_template, sms_template
):
    pno = render_pno.run(
        pno=pre_rendered_pno_2,
        html_for_pdf_template=html_for_pdf_template,
        email_body_template=email_body_template,
        sms_template=sms_template,
    )

    test_sms_filepath = (
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_sms_2.txt"
    )
    test_html_filepath = (
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_pno_2.html"
    )
    test_email_body_file_path = (
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_email_body_2.html"
    )

    ######################### Uncomment to replace test files #########################
    # with open(test_html_filepath, "w") as f:
    #     f.write(pno.html_for_pdf)

    # with open(test_email_body_file_path, "w") as f:
    #     f.write(pno.html_email_body)

    # with open(test_sms_filepath, "w") as f:
    #     f.write(pno.sms_content)

    ###################################################################################
    with open(test_html_filepath, "r") as f:
        expected_html = f.read()

    with open(test_email_body_file_path, "r") as f:
        expected_html_email_body = f.read()

    with open(test_sms_filepath, "r") as f:
        expected_sms_content = f.read()

    assert isinstance(pno, RenderedPno)
    assert pno.html_for_pdf == expected_html
    assert pno.html_email_body == expected_html_email_body
    assert pno.report_id == "12"
    assert pno.source == PnoSource.LOGBOOK
    assert pno.sms_content == expected_sms_content


def test_render_pno_1_pdf(
    html_for_pdf_template, pre_rendered_pno_1, email_body_template, sms_template
):
    pno = render_pno.run(
        pno=pre_rendered_pno_1,
        html_for_pdf_template=html_for_pdf_template,
        email_body_template=email_body_template,
        sms_template=sms_template,
    )
    pdf = pypdf.PdfReader(io.BytesIO(pno.pdf_document))

    test_filepath = TEST_DATA_LOCATION / "emails/prior_notifications/expected_pno_1.pdf"

    ######################### Uncomment to replace test files #########################
    # with open(test_filepath, "wb") as f:
    #     f.write(pdf)

    ###################################################################################
    with open(test_filepath, "rb") as f:
        expected_pdf = pypdf.PdfReader(io.BytesIO(f.read()))

    assert expected_pdf.pages[0].extract_text() == pdf.pages[0].extract_text()

    assert pno.report_id == "11"
    assert pno.source == PnoSource.LOGBOOK
    assert isinstance(pno.generation_datetime_utc, datetime)


def test_render_pno_2_pdf(
    html_for_pdf_template, pre_rendered_pno_2, email_body_template, sms_template
):
    pno = render_pno.run(
        pno=pre_rendered_pno_2,
        html_for_pdf_template=html_for_pdf_template,
        email_body_template=email_body_template,
        sms_template=sms_template,
    )
    pdf = pypdf.PdfReader(io.BytesIO(pno.pdf_document))

    test_filepath = TEST_DATA_LOCATION / "emails/prior_notifications/expected_pno_2.pdf"

    ######################### Uncomment to replace test files #########################
    # with open(test_filepath, "wb") as f:
    #     f.write(pdf)

    ###################################################################################
    with open(test_filepath, "rb") as f:
        expected_res = pypdf.PdfReader(io.BytesIO(f.read()))

    assert expected_res.pages[0].extract_text() == pdf.pages[0].extract_text()

    assert pno.report_id == "12"
    assert pno.source == PnoSource.LOGBOOK
    assert isinstance(pno.generation_datetime_utc, datetime)


def test_load_pno_pdf_documents(reset_test_data):
    # Setup
    test_filepaths = [
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_pno_1.pdf",
        TEST_DATA_LOCATION / "emails/prior_notifications/expected_pno_2.pdf",
    ]

    pnos = []

    for fp, report_id, is_being_sent in zip(
        test_filepaths, ["existing-report-id", "new-report-id"], [True, False]
    ):
        with open(fp, "rb") as f:
            pdf = f.read()

        pnos.append(
            RenderedPno(
                report_id=report_id,
                vessel_id=66,
                cfr="XXX999999999",
                is_verified=True,
                is_being_sent=is_being_sent,
                trip_segments=[],
                port_locode="FRBOL",
                source=PnoSource.LOGBOOK,
                generation_datetime_utc=datetime(2020, 5, 6, 8, 52, 42),
                pdf_document=pdf,
            )
        )

    query = """
        SELECT *
        FROM prior_notification_pdf_documents
        WHERE report_id IN ('existing-report-id', 'new-report-id', '12')
        ORDER BY report_id
    """
    initial_pdfs = read_query(query, db="monitorfish_remote")

    ### Run ###
    pno_pdf_documents_being_sent = load_pno_pdf_documents.run(pnos)

    ### Asserts ###
    final_pdfs = read_query(query, db="monitorfish_remote")

    # Test pdf document equality

    # report-id '12' was in the database initially and should be unchanged
    assert (
        (
            initial_pdfs.loc[initial_pdfs.report_id == "12", "pdf_document"]
            .values[0]
            .tobytes()
        )
        == b"This is a PDF document"
        == (
            final_pdfs.loc[final_pdfs.report_id == "12", "pdf_document"]
            .values[0]
            .tobytes()
        )
    )

    # report-id 'existing-report-id' was in the database initially and should be replaced
    assert (
        (
            initial_pdfs.loc[
                initial_pdfs.report_id == "existing-report-id", "pdf_document"
            ]
            .values[0]
            .tobytes()
        )
        == b"Anonymous didn't code this"
        != (
            final_pdfs.loc[final_pdfs.report_id == "existing-report-id", "pdf_document"]
            .values[0]
            .tobytes()
        )
        == pnos[0].pdf_document
    )

    # report-id 'new-report-id' was not in database initially and should be inserted
    assert "new-report-id" not in initial_pdfs.report_id
    assert (
        final_pdfs.loc[final_pdfs.report_id == "new-report-id", "pdf_document"]
        .values[0]
        .tobytes()
        == pnos[1].pdf_document
    )

    assert isinstance(pno_pdf_documents_being_sent, list)
    assert len(pno_pdf_documents_being_sent) == 1
    assert pno_pdf_documents_being_sent[0] == pnos[0]


def test_attribute_addressees_uses_target_vessels_and_segments(
    pno_pdf_document_to_distribute_targeted_vessel_and_segments,
    pno_units_targeting_vessels,
    pno_units_ports_and_segments_subscriptions,
):
    res = attribute_addressees.run(
        pno_pdf_document_to_distribute_targeted_vessel_and_segments,
        pno_units_targeting_vessels,
        pno_units_ports_and_segments_subscriptions,
    )
    assert res == dataclasses.replace(
        pno_pdf_document_to_distribute_targeted_vessel_and_segments,
        control_unit_ids={1, 2, 3},
    )


def test_attribute_addressees_uses_receive_all_pnos_from_port(
    pno_pdf_document_to_distribute_receive_all_pnos_from_port,
    pno_units_targeting_vessels,
    pno_units_ports_and_segments_subscriptions,
):
    res = attribute_addressees.run(
        pno_pdf_document_to_distribute_receive_all_pnos_from_port,
        pno_units_targeting_vessels,
        pno_units_ports_and_segments_subscriptions,
    )
    assert res == dataclasses.replace(
        pno_pdf_document_to_distribute_receive_all_pnos_from_port, control_unit_ids={4}
    )


def test_attribute_addressees_returns_empty_addressees(
    pno_pdf_document_to_distribute_without_addressees,
    pno_units_targeting_vessels,
    pno_units_ports_and_segments_subscriptions,
):
    res = attribute_addressees.run(
        pno_pdf_document_to_distribute_without_addressees,
        pno_units_targeting_vessels,
        pno_units_ports_and_segments_subscriptions,
    )
    assert res == dataclasses.replace(
        pno_pdf_document_to_distribute_without_addressees, control_unit_ids=set()
    )


def test_attribute_addressees_when_is_verified(
    pno_pdf_document_to_distribute_verified,
    pno_units_targeting_vessels,
    pno_units_ports_and_segments_subscriptions,
):
    res = attribute_addressees.run(
        pno_pdf_document_to_distribute_verified,
        pno_units_targeting_vessels,
        pno_units_ports_and_segments_subscriptions,
    )
    assert res == dataclasses.replace(
        pno_pdf_document_to_distribute_verified, control_unit_ids={2, 3}
    )


@patch("src.pipeline.flows.distribute_pnos.requests")
def test_fetch_control_units_contacts(
    mock_requests, monitorenv_control_units_api_response, control_units_contacts
):
    response = Response()
    response.status_code = 200
    response._content = json.dumps(monitorenv_control_units_api_response).encode(
        "utf-8"
    )
    response.encoding = "utf-8"

    mock_requests.get.return_value = response
    res = fetch_control_units_contacts.run()
    pd.testing.assert_frame_equal(res, control_units_contacts)


# def test_flow(reset_test_data):
#     flow.schedule = None
#     state = flow.run()

#     assert state.is_successful()
