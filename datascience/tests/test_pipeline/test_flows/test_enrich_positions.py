from datetime import datetime, timedelta
from logging import Logger

import pandas as pd
import pytest

from src.pipeline.flows.enrich_positions import (
    enrich_positions_by_vessel,
    extract_enrich_load,
    extract_positions,
    filter_already_enriched_vessels,
    flow,
    load_fishing_activity,
    reset_positions,
)
from src.pipeline.helpers.dates import Period
from src.read_query import read_query


def test_extract_positions(reset_test_data):
    now = datetime.utcnow()
    period = Period(
        start=now - timedelta(days=1, minutes=10), end=now + timedelta(minutes=1)
    )
    positions = extract_positions(period)

    assert len(positions) == 8
    assert (
        positions.loc[:, "id"].values
        == [
            13641745,
            13632807,
            13634205,
            13635518,
            13637054,
            13638407,
            13640935,
            13639642,
        ]
    ).all()
    assert list(positions) == [
        "id",
        "cfr",
        "external_immatriculation",
        "ircs",
        "datetime_utc",
        "latitude",
        "longitude",
        "is_at_port",
    ]


def test_filter_already_enriched_vessels():
    positions = pd.DataFrame(
        {
            "cfr": ["A", "B", "A", "C", "C", "B"],
            "external_immatriculation": ["AA", "BB", None, "CC", "CC", "BBB"],
            "ircs": ["AAA", "BBB", "AAA", "CCC", "CCC", "BBB"],
            "is_at_port": [None, False, False, True, None, False],
        }
    )

    filtered_positions = filter_already_enriched_vessels(positions)

    expected_filtered_positions = positions.loc[[0, 2, 3, 4], :].reset_index(drop=True)

    pd.testing.assert_frame_equal(filtered_positions, expected_filtered_positions)


def test_filter_already_enriched_vessels_empty_input():
    positions = pd.DataFrame(
        columns=pd.Index(["cfr", "external_immatriculation", "ircs", "is_at_port"])
    )

    filtered_positions = filter_already_enriched_vessels(positions)

    pd.testing.assert_frame_equal(filtered_positions, positions, check_index_type=False)


def test_enrich_positions_by_vessel():

    d = datetime(2021, 5, 1, 12, 0, 0)
    td = timedelta(hours=1)

    positions = pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "cfr": ["A", "A", "B", "B", "B", "A", "A", "B", "B", "A"],
            "external_immatriculation": [
                "AA",
                "AA",
                "BB",
                "BB",
                "BB",
                "AA",
                "AA",
                "BB",
                "BB",
                "AA",
            ],
            "ircs": [
                "AAA",
                "AAA",
                "BBB",
                "BBB",
                "BBB",
                "AAA",
                "AAA",
                "BBB",
                "BBB",
                "AAA",
            ],
            "latitude": [
                45,
                45.05,
                -25.2,
                -25.1,
                -25.0,
                45.0,
                44.95,
                -24.9,
                -24.8,
                44.9,
            ],
            "longitude": [-4, -4.05, 0.0, 0.1, 0.2, -4.1, -4.15, 0.2, 0.3, -4.2],
            "datetime_utc": [
                d,
                d + td,
                d,
                d + td,
                d + 2 * td,
                d + 2 * td,
                d + 3 * td,
                d + 3 * td,
                d + 4 * td,
                d + 4 * td,
            ],
            "is_at_port": [
                True,
                True,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
                False,
            ],
        }
    )

    enriched_positions = enrich_positions_by_vessel(
        positions, minimum_consecutive_positions=3, fishing_speed_threshold=4.5
    )

    expected_enriched_positions = positions.loc[[0, 1, 5, 6, 9, 2, 3, 4, 7, 8], :].copy(
        deep=True
    )
    expected_enriched_positions["meters_from_previous_position"] = [
        None,
        6808.287716,
        6808.287716,
        6810.268455,
        6812.248615,
        None,
        14998.491839,
        15004.017857,
        11119.505198,
        15015.015454,
    ]
    expected_enriched_positions["time_since_previous_position"] = [
        None,
        td,
        td,
        td,
        td,
        None,
        td,
        td,
        td,
        td,
    ]
    expected_enriched_positions["average_speed"] = [
        None,
        3.676181,
        3.676181,
        3.677251,
        3.678320,
        None,
        8.098538,
        8.101522,
        6.004052,
        8.107460,
    ]
    expected_enriched_positions["is_fishing"] = [
        False,
        False,
        True,
        True,
        True,
        None,
        False,
        False,
        False,
        False,
    ]

    pd.testing.assert_frame_equal(enriched_positions, expected_enriched_positions)


def test_enrich_positions_by_vessel_handles_empty_input():

    positions = pd.DataFrame(
        columns=[
            "id",
            "cfr",
            "external_immatriculation",
            "ircs",
            "latitude",
            "longitude",
            "datetime_utc",
            "is_at_port",
        ]
    )

    enriched_positions = enrich_positions_by_vessel(
        positions, minimum_consecutive_positions=3, fishing_speed_threshold=4.5
    )

    expected_new_columns = [
        "meters_from_previous_position",
        "time_since_previous_position",
        "average_speed",
        "is_fishing",
    ]
    expected_enriched_positions = pd.DataFrame(
        columns=list(positions) + expected_new_columns
    )
    pd.testing.assert_frame_equal(
        enriched_positions, expected_enriched_positions, check_dtype=False
    )


def test_load_then_reset_fishing_activity(reset_test_data):
    positions_1 = pd.DataFrame(
        {
            "id": [13632807],
            "is_at_port": [False],
            "meters_from_previous_position": [8963.2],
            "time_since_previous_position": [timedelta(hours=1)],
            "average_speed": [2.3],
            "is_fishing": [True],
        }
    )
    positions_2 = pd.DataFrame(
        {
            "id": [13632807, 13635518, 13638407, 13640935],
            "is_at_port": [False, True, True, True],
            "meters_from_previous_position": [None, 0.0, 1256.0, 5632.3],
            "time_since_previous_position": [
                None,
                timedelta(hours=1),
                timedelta(hours=1),
                timedelta(minutes=45),
            ],
            "average_speed": [None, 0.0, 0.678, 3.04],
            "is_fishing": [None, False, False, False],
        }
    )

    now = datetime.utcnow()
    period = Period(start=now - timedelta(hours=4), end=now)
    logger = Logger("logger")

    load_fishing_activity(positions_1, period, logger)
    load_fishing_activity(positions_2, period, logger)

    loaded_positions = read_query(
        "monitorfish_remote",
        """SELECT id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        WHERE id IN (13632807, 13635518, 13638407, 13640935)
        ORDER BY id""",
    )

    pd.testing.assert_frame_equal(
        pd.concat([positions_1, positions_2]).drop_duplicates(subset=["id"]),
        loaded_positions,
        check_dtype=False,
    )

    period = Period(start=now - timedelta(hours=4), end=now - timedelta(hours=2))
    reset_positions.run(period)

    not_enriched_ids = read_query(
        "monitorfish_remote",
        "SELECT id FROM positions WHERE is_at_port IS NULL ORDER BY id",
    )["id"].tolist()

    assert not_enriched_ids == [13632807, 13634205, 13635518, 13639642]

    positions_reset = read_query(
        "monitorfish_remote",
        """SELECT
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        WHERE id IN (13632807, 13635518)
        ORDER BY id""",
    )

    assert positions_reset.isna().all().all()


def test_extract_enrich_load(reset_test_data):

    now = datetime.utcnow()
    period = Period(start=now - timedelta(hours=4), end=now)
    extract_enrich_load.run(
        period, minimum_consecutive_positions=2, fishing_speed_threshold=4.5
    )

    positions = read_query(
        "monitorfish_remote",
        """SELECT
            internal_reference_number,
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        ORDER BY internal_reference_number, date_time""",
    )

    # The number of positions in the positions table should not change
    assert len(positions) == 15

    # Positions outside of the selected Period should not be affected
    assert (
        positions.loc[positions.id == "13641745", "meters_from_previous_position"]
        == 2500
    ).all()

    # Positions for which the flow run yields null values should default to the value
    # previously in the table
    assert (
        positions.loc[positions.id == "13634205", "meters_from_previous_position"]
        == 2050
    ).all()

    # Positions for which the flow run yields non null values should replace the value
    # previously in the table
    assert (
        positions.loc[positions.id == "13637054", "meters_from_previous_position"]
        == 657.987
    ).all()
    assert positions.loc[positions.id == "13637054", "is_fishing"].all()


def test_flow_does_not_recompute_all_when_not_asked_to(reset_test_data):
    flow.schedule = None

    # Vessel 'ABC000055481' has all its positions already enriched in the test_date
    positions_before = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        WHERE internal_reference_number = 'ABC000055481'
        ORDER BY date_time""",
    )

    flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=48 * 60,
        chunk_overlap_minutes=180,
        minimum_consecutive_positions=2,
        fishing_speed_threshold=4.5,
        recompute_all=False,
    )

    positions_after = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        WHERE internal_reference_number = 'ABC000055481'
        ORDER BY date_time""",
    )

    pd.testing.assert_frame_equal(positions_before, positions_after)


def test_flow_does_recomputes_all_when_asked_to(reset_test_data):
    flow.schedule = None

    # Vessel 'ABC000055481' has all its positions already enriched in the test_date
    positions_before = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        WHERE internal_reference_number = 'ABC000055481'
        ORDER BY date_time""",
    )

    flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=48 * 60,
        chunk_overlap_minutes=180,
        minimum_consecutive_positions=2,
        fishing_speed_threshold=4.5,
        recompute_all=True,
    )

    positions_after = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        WHERE internal_reference_number = 'ABC000055481'
        ORDER BY date_time""",
    )

    with pytest.raises(AssertionError):
        pd.testing.assert_frame_equal(positions_before, positions_after)

    assert (
        positions_after.loc[positions_after.id == 13632385, "is_fishing"].isna().all()
    )
    assert positions_after.loc[positions_after.id != 13632385, "is_fishing"].all()
    assert (
        positions_after.loc[positions_after.id == 13637980, "average_speed"] == 1.002370
    ).all()


def test_flow_can_compute_in_chunks(reset_test_data):
    flow.schedule = None

    positions_before = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        ORDER BY id""",
    )

    flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=30 * 60,
        chunk_overlap_minutes=6 * 60,
        minimum_consecutive_positions=2,
        fishing_speed_threshold=4.5,
        recompute_all=True,
    )

    positions_enriched_in_2_chunks = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        ORDER BY id""",
    )

    flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=48 * 60,
        chunk_overlap_minutes=6 * 60,
        minimum_consecutive_positions=2,
        fishing_speed_threshold=4.5,
        recompute_all=True,
    )

    positions_enriched_in_1_chunk = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing
        FROM positions
        ORDER BY id""",
    )

    with pytest.raises(AssertionError):
        pd.testing.assert_frame_equal(positions_before, positions_enriched_in_2_chunks)

    pd.testing.assert_frame_equal(
        positions_enriched_in_1_chunk, positions_enriched_in_2_chunks
    )
