from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest
from dateutil.relativedelta import relativedelta

from src.pipeline.flows.distribute_pnos import extract_pnos_to_distribute, flow
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def expected_extracted_pnos() -> pd.DataFrame:
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


def test_extract_pnos_to_distribute(reset_test_data, expected_extracted_pnos):
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
        expected_extracted_pnos.drop(columns=approximate_datetime_columns),
    )

    for col in approximate_datetime_columns:
        assert (
            (pnos[col].dropna() - expected_extracted_pnos[col].dropna()).abs()
            < timedelta(seconds=10)
        ).all()


# def test_flow(reset_test_data):
#     flow.schedule = None
#     state = flow.run()

#     assert state.is_successful()
