from datetime import datetime
from logging import Logger

import pandas as pd
import pytest
import pytz
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.flows.enrich_logbook import (
    compute_pno_segments,
    compute_pno_types,
    extract_pno_species_and_gears,
    extract_pno_trips_period,
    extract_pno_types,
    flow,
    load_enriched_pnos,
    merge_segments_and_types,
    reset_pnos,
)
from src.pipeline.helpers.dates import Period
from src.read_query import read_query
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
                [],
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


@pytest.fixture
def segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "year": [2023, 2023, 2023, 2023, 2015],
            "segment": ["SOTM", "SHKE27", "SSB", "SxTB8910", "SxTB8910-2015"],
            "segment_name": [
                "Chaluts pélagiques",
                "Merlu en zone 27",
                "Senne de plage",
                "Merlu Morue xTB zones 8 9 10",
                "Merlu Morue xTB zones 8 9 10 (2015)",
            ],
            "gears": [
                ["OTM", "PTM"],
                [],
                ["SB"],
                ["OTB", "PTB"],
                ["OTB", "PTB"],
            ],
            "fao_areas": [
                [],
                ["27"],
                [],
                ["27.8", "27.9", "27.10"],
                ["27.8", "27.9", "27.10"],
            ],
            "species": [
                [],
                ["HKE"],
                [],
                ["HKE", "COD"],
                ["HKE", "COD"],
            ],
        }
    )


@pytest.fixture
def expected_computed_pno_types() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 5, 6, 7, 8],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                ],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                [],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "SB", "mesh": 20, "dimensions": "4.5"}],
            ],
            "pno_types": [
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    }
                ],
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                    {
                        "pno_type_name": "Préavis type 2",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                ],
                [
                    {
                        "pno_type_name": "Préavis par pavillon",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                ],
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    }
                ],
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                    {
                        "pno_type_name": "Préavis type 2",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                ],
                None,
                None,
                [
                    {
                        "pno_type_name": "Préavis par engin",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    }
                ],
            ],
        }
    )


@pytest.fixture
def expected_computed_pno_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 5, 6, 7, 8],
            "trip_segments": [
                None,
                None,
                None,
                [
                    {
                        "segment": "SxTB8910",
                        "segment_name": "Merlu Morue xTB zones 8 9 10",
                    }
                ],
                [{"segment": "SOTM", "segment_name": "Chaluts pélagiques"}],
                [
                    {"segment": "SHKE27", "segment_name": "Merlu en zone 27"},
                    {"segment": "SOTM", "segment_name": "Chaluts pélagiques"},
                ],
                [{"segment": "SOTM", "segment_name": "Chaluts pélagiques"}],
                [{"segment": "SSB", "segment_name": "Senne de plage"}],
            ],
        }
    )


@pytest.fixture
def pnos_to_load() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [12, 13],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                ],
                [],
            ],
            "pno_types": [
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                    {
                        "pno_type_name": "Préavis type 2",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                ],
                None,
            ],
            "trip_segments": [
                None,
                [
                    {"segment": "SHKE27", "segment_name": "Merlu en zone 27"},
                    {"segment": "SOTM", "segment_name": "Chaluts pélagiques"},
                ],
            ],
        }
    )


@pytest.fixture
def expected_loaded_pnos() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [8, 12, 13],
            "enriched": [False, True, True],
            "trip_gears": [
                None,
                [
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                ],
                [],
            ],
            "pno_types": [
                None,
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "has_designated_ports": True,
                        "minimum_notification_period": 4.0,
                    },
                    {
                        "pno_type_name": "Préavis type 2",
                        "has_designated_ports": True,
                        "minimum_notification_period": 4.0,
                    },
                ],
                [],
            ],
            "trip_segments": [
                None,
                [],
                [
                    {"segment": "SHKE27", "segment_name": "Merlu en zone 27"},
                    {"segment": "SOTM", "segment_name": "Chaluts pélagiques"},
                ],
            ],
        }
    )


@pytest.fixture
def expected_merged_pnos() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "logbook_reports_pno_id": [1, 2, 3, 4, 5, 6, 7, 8],
            "trip_gears": [
                [
                    {"gear": "OTT", "mesh": 120, "dimensions": "250.0"},
                    {"gear": "OTT", "mesh": 140, "dimensions": "250.0"},
                ],
                [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}],
                [],
                [{"gear": "OTB", "mesh": 100, "dimensions": "250.0"}],
                [{"gear": "PTM", "mesh": 70, "dimensions": "250.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "OTM", "mesh": 80, "dimensions": "200.0"}],
                [{"gear": "SB", "mesh": 20, "dimensions": "4.5"}],
            ],
            "pno_types": [
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    }
                ],
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                    {
                        "pno_type_name": "Préavis type 2",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                ],
                [
                    {
                        "pno_type_name": "Préavis par pavillon",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                ],
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    }
                ],
                [
                    {
                        "pno_type_name": "Préavis type 1",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                    {
                        "pno_type_name": "Préavis type 2",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    },
                ],
                None,
                None,
                [
                    {
                        "pno_type_name": "Préavis par engin",
                        "minimum_notification_period": 4.0,
                        "has_designated_ports": True,
                    }
                ],
            ],
            "trip_segments": [
                None,
                None,
                None,
                [
                    {
                        "segment": "SxTB8910",
                        "segment_name": "Merlu Morue xTB zones 8 9 10",
                    }
                ],
                [{"segment": "SOTM", "segment_name": "Chaluts pélagiques"}],
                [
                    {"segment": "SHKE27", "segment_name": "Merlu en zone 27"},
                    {"segment": "SOTM", "segment_name": "Chaluts pélagiques"},
                ],
                [{"segment": "SOTM", "segment_name": "Chaluts pélagiques"}],
                [{"segment": "SSB", "segment_name": "Senne de plage"}],
            ],
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


def test_compute_pno_types(
    expected_pno_types, sample_pno_species_and_gears, expected_computed_pno_types
):
    res = compute_pno_types(sample_pno_species_and_gears, expected_pno_types)
    pd.testing.assert_frame_equal(res, expected_computed_pno_types)


def test_compute_pno_types_with_empty_gears_list_only(
    expected_pno_types, sample_pno_species_and_gears, expected_computed_pno_types
):
    assert sample_pno_species_and_gears.loc[2, "trip_gears"] == []
    res = compute_pno_types(sample_pno_species_and_gears.loc[[2]], expected_pno_types)
    pd.testing.assert_frame_equal(
        res, expected_computed_pno_types.loc[[2]].reset_index(drop=True)
    )


def test_compute_pno_segments(
    reset_test_data,
    sample_pno_species_and_gears,
    segments,
    expected_computed_pno_segments,
):
    res = compute_pno_segments(sample_pno_species_and_gears, segments)
    pd.testing.assert_frame_equal(res, expected_computed_pno_segments)


def test_compute_pno_segments_with_empty_gears_only(
    reset_test_data,
    sample_pno_species_and_gears,
    segments,
    expected_computed_pno_segments,
):
    assert sample_pno_species_and_gears.loc[2, "trip_gears"] == []
    res = compute_pno_segments(sample_pno_species_and_gears.loc[[2]], segments)
    pd.testing.assert_frame_equal(
        res, expected_computed_pno_segments.loc[[2]].reset_index(drop=True)
    )


def test_merge_segments_and_types(
    expected_computed_pno_types, expected_computed_pno_segments, expected_merged_pnos
):
    res = merge_segments_and_types(
        expected_computed_pno_types, expected_computed_pno_segments
    )
    pd.testing.assert_frame_equal(res, expected_merged_pnos)


def test_load_then_reset_logbook(reset_test_data, pnos_to_load, expected_loaded_pnos):
    query = (
        "SELECT id, enriched, trip_gears, value->'pnoTypes' AS pno_types, trip_segments "
        "FROM logbook_reports WHERE log_type = 'PNO' ORDER BY id"
    )
    initial_pnos = read_query(query, db="monitorfish_remote")
    pno_period = Period(
        start=datetime(2020, 5, 6, 18, 30, 0), end=datetime(2020, 5, 6, 18, 50, 0)
    )
    logger = Logger("myLogger")
    load_enriched_pnos(enriched_pnos=pnos_to_load, period=pno_period, logger=logger)
    final_pnos = read_query(query, db="monitorfish_remote")

    assert not initial_pnos.enriched.any()
    assert not final_pnos.loc[final_pnos.id == 8, "enriched"].values[0]
    assert final_pnos.loc[final_pnos.id.isin([12, 13]), "enriched"].all()

    pd.testing.assert_frame_equal(final_pnos, expected_loaded_pnos)

    # Reset logbook and check that the logbook_reports table is back to its original
    # state.
    reset_pnos.run(pno_period)
    pnos_after_reset = read_query(query, db="monitorfish_remote")
    pd.testing.assert_frame_equal(pnos_after_reset, initial_pnos)


def test_flow(reset_test_data):
    query = (
        "SELECT id, enriched, trip_gears, value->'pnoTypes' AS pno_types, trip_segments "
        "FROM logbook_reports WHERE log_type = 'PNO' ORDER BY id"
    )

    initial_pnos = read_query(query, db="monitorfish_remote")

    now = datetime.utcnow()
    pno_start_date = datetime(2020, 5, 5)
    pno_end_date = datetime(2020, 5, 7)

    start_hours_ago = int((now - pno_start_date).total_seconds() / 3600)
    end_hours_ago = int((now - pno_end_date).total_seconds() / 3600)
    minutes_per_chunk = 2 * 24 * 60

    # First run
    state = flow.run(
        start_hours_ago=start_hours_ago,
        end_hours_ago=end_hours_ago,
        minutes_per_chunk=minutes_per_chunk,
        recompute_all=False,
    )
    assert state.is_successful()

    pnos_after_first_run = read_query(query, db="monitorfish_remote")

    # Manual update : reset PNO n°12, modify PNO n°13
    e = create_engine("monitorfish_remote")
    with e.begin() as conn:
        conn.execute(
            text("UPDATE logbook_reports SET enriched = false " "WHERE id = 12;")
        )

        conn.execute(
            text(
                "UPDATE logbook_reports "
                """SET trip_gears = '[{"gear": "This was set manually"}]'::jsonb """
                "WHERE id = 13;"
            )
        )

    # Second run without reset : manual modifications on PNO n°13 should be preserved
    state = flow.run(
        start_hours_ago=start_hours_ago,
        end_hours_ago=end_hours_ago,
        minutes_per_chunk=minutes_per_chunk,
        recompute_all=False,
    )
    assert state.is_successful()

    pnos_after_second_run_without_reset = read_query(query, db="monitorfish_remote")

    # Third run with reset : manual modifications on PNO n°13 should be erased and
    # recomputed.
    state = flow.run(
        start_hours_ago=start_hours_ago,
        end_hours_ago=end_hours_ago,
        minutes_per_chunk=minutes_per_chunk,
        recompute_all=True,
    )
    assert state.is_successful()

    pnos_after_third_run_with_reset = read_query(query, db="monitorfish_remote")

    # Initially no PNO should be enriched
    assert (
        not initial_pnos[["enriched", "trip_gears", "pno_types", "trip_segments"]]
        .any()
        .any()
    )

    # After first run PNO with ids 12 and 13 should be enriched
    assert set(pnos_after_first_run.loc[pnos_after_first_run.enriched, "id"]) == {
        12,
        13,
    }
    assert pnos_after_first_run.loc[pnos_after_first_run.id == 12, "trip_gears"].iloc[
        0
    ] == [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}]

    assert pnos_after_first_run.loc[pnos_after_first_run.id == 13, "trip_gears"].iloc[
        0
    ] == [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}]

    # After second run without reset, manual modifications on PNO n°13 should be
    # preserved
    assert pnos_after_second_run_without_reset.loc[
        pnos_after_second_run_without_reset.id == 12, "trip_gears"
    ].iloc[0] == [{"gear": "TBB", "mesh": 140, "dimensions": "250.0"}]
    assert pnos_after_second_run_without_reset.loc[
        pnos_after_second_run_without_reset.id == 13, "trip_gears"
    ].iloc[0] == [{"gear": "This was set manually"}]

    # After third run with reset, manual modifications on PNO n°13 should be erased and
    # recomputed.
    pd.testing.assert_frame_equal(pnos_after_first_run, pnos_after_third_run_with_reset)
