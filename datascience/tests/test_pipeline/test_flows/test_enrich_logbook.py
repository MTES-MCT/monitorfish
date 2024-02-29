from datetime import datetime

import pandas as pd
import pytest
import pytz

from src.pipeline.flows.enrich_logbook import (
    compute_pno_types,
    extract_pno_species_and_gears,
    extract_pno_trips_period,
    extract_pno_types,
    flow,
)
from src.pipeline.helpers.dates import Period
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def expected_pno_types() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "pno_type_id": [1, 1, 1, 2, 2, 3, 4],
            "pno_type_name": [
                "Préavis type 1",
                "Préavis type 1",
                "Préavis type 1",
                "Préavis type 2",
                "Préavis type 2",
                "Préavis par pavillon",
                "Préavis par engin",
            ],
            "minimum_notification_period": [4.0, 4.0, 4.0, 4.0, 4.0, 4.0, 4.0],
            "has_designated_ports": [True, True, True, True, True, True, True],
            "pno_type_rule_id": [1, 2, 3, 4, 5, 6, 7],
            "species": [
                ["HKE", "BSS", "COD", "ANF", "SOL"],
                ["HKE"],
                ["HER", "MAC", "HOM", "WHB"],
                ["HKE", "BSS", "COD", "ANF", "SOL"],
                ["HER", "MAC", "HOM", "WHB"],
                [],
                [],
            ],
            "fao_areas": [
                [
                    "27.3.a",
                    "27.4",
                    "27.6",
                    "27.7",
                    "27.8.a",
                    "27.8.b",
                    "27.8.c",
                    "27.8.d",
                    "27.9.a",
                ],
                ["37"],
                ["27", "34.1.2", "34.2"],
                [
                    "27.3.a",
                    "27.4",
                    "27.6",
                    "27.7",
                    "27.8.a",
                    "27.8.b",
                    "27.8.c",
                    "27.8.d",
                    "27.9.a",
                ],
                ["27", "34.1.2", "34.2"],
                [],
                [],
            ],
            "gears": [[], [], [], [], [], [], ["SB"]],
            "flag_states": [[], [], [], [], [], ["GBR", "VEN"], []],
            "minimum_quantity_kg": [0.0, 0.0, 10000.0, 2000.0, 10000.0, 0.0, 0.0],
        }
    )


@pytest.fixture
def sample_pno_species_and_gears() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 4, 4, 5, 5, 5, 6, 7, 8],
            "year": [
                2021,
                2022,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
                2023,
            ],
            "species": [
                "HKE",
                "HKE",
                "HKE",
                "BSS",
                "COD",
                "COD",
                "MAC",
                "HOM",
                "HER",
                "HKE",
                None,
                None,
            ],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                ],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                None,
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "SB", "mesh": 20, "dimensions": "4.5"}],
            ],
            "fao_area": [
                "27.9.a",
                "27.9.a",
                "37.1.3",
                "27.7.d",
                "27.8.c",
                "27.10.c",
                "27.7.d",
                "27.8.a",
                "34.1.2",
                "27.2.a",
                None,
                None,
            ],
            "weight": [
                1500.0,
                2500.0,
                2500.0,
                800.0,
                800.0,
                800.0,
                5000.0,
                5000.0,
                5000.0,
                3500.0,
                None,
                None,
            ],
            "flag_state": [
                "FRA",
                "FRA",
                "GBR",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
                "FRA",
            ],
        }
    )


@pytest.fixture
def expected_pno_species_and_gears() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [12, 13],
            "year": [2020, 2020],
            "species": ["GHL", None],
            "trip_gears": [
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
            ],
            "fao_area": ["27.7.a", None],
            "weight": [1500.0, None],
            "flag_state": ["CYP", "CYP"],
        }
    )


def test_extract_pno_types(reset_test_data, expected_pno_types):
    pno_types = extract_pno_types.run()
    pd.testing.assert_frame_equal(pno_types, expected_pno_types)


def test_extract_pno_trips_period(reset_test_data):
    pno_period = Period(
        start=datetime(2020, 5, 6, 18, 30, 0), end=datetime(2020, 5, 6, 18, 50, 0)
    )
    expected_trips_period = Period(
        start=pytz.UTC.localize(datetime(2020, 5, 4, 19, 41, 3, 340000)),
        end=pytz.UTC.localize(datetime(2020, 5, 6, 20, 41, 9, 200000)),
    )
    trips_period = extract_pno_trips_period(period=pno_period)
    assert trips_period == expected_trips_period


def test_extract_pno_species_and_gears(reset_test_data, expected_pno_species_and_gears):
    pno_species_and_gears = extract_pno_species_and_gears(
        pno_emission_period=Period(
            start=datetime(2020, 5, 6, 18, 30, 0), end=datetime(2020, 5, 6, 18, 50, 0)
        ),
        trips_period=Period(
            start=pytz.UTC.localize(datetime(2020, 5, 4, 19, 41, 3, 340000)),
            end=pytz.UTC.localize(datetime(2020, 5, 6, 20, 41, 9, 200000)),
        ),
    )

    pd.testing.assert_frame_equal(
        pno_species_and_gears.sort_values("logbook_reports_pno_id").reset_index(
            drop=True
        ),
        expected_pno_species_and_gears,
    )


def test_compute_pno_types(expected_pno_types, sample_pno_species_and_gears):
    compute_pno_types(sample_pno_species_and_gears, expected_pno_types)


def test_load_then_reset_logbook(reset_test_data):
    # pnos = read_query("SELECT * FROM logbook_reports WHERE log_type = 'PNO'", db="monitorfish_remote")
    # breakpoint()
    pass


def test_extract_enrich_load(reset_test_data):
    pass


def test_flow_does_not_recompute_all_when_not_asked_to(reset_test_data):
    pass


def test_flow_recomputes_all_when_asked_to(reset_test_data):
    pass
