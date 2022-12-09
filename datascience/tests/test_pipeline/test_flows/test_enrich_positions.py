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
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


def test_extract_positions(reset_test_data):
    now = datetime.utcnow()
    period = Period(
        start=now - timedelta(days=1, minutes=10), end=now + timedelta(minutes=1)
    )
    positions = extract_positions(period)

    assert len(positions) == 19
    assert (
        positions.loc[:, "id"].values
        == [
            13641745,
            13786527,
            13786528,
            13786529,
            13732807,
            13786530,
            13786523,
            13735518,
            13786532,
            13738407,
            13786531,
            13632807,
            13634205,
            13635518,
            13637054,
            13638407,
            13640935,
            13639642,
            13740935,
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
        "time_emitting_at_sea",
    ]


def test_filter_already_enriched_vessels():
    positions = pd.DataFrame(
        {
            "cfr": ["A", "B", "A", "C", "C", "B"],
            "external_immatriculation": ["AA", "BB", None, "CC", "CC", "BBB"],
            "ircs": ["AAA", "BBB", "AAA", "CCC", "CCC", "BBB"],
            "is_at_port": [None, False, False, True, None, False],
            "time_emitting_at_sea": [pd.NaT, pd.NaT, pd.NaT, pd.NaT, pd.NaT, pd.NaT],
        }
    )

    filtered_positions = filter_already_enriched_vessels(positions)

    expected_filtered_positions = positions.loc[[0, 2, 3, 4], :].reset_index(drop=True)

    pd.testing.assert_frame_equal(filtered_positions, expected_filtered_positions)


def test_filter_already_enriched_vessels_empty_input():
    positions = pd.DataFrame(
        columns=pd.Index(
            [
                "cfr",
                "external_immatriculation",
                "ircs",
                "is_at_port",
                "time_emitting_at_sea",
            ]
        )
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
            "time_emitting_at_sea": [
                pd.NaT,
                pd.NaT,
                13 * td,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
            ],
        }
    )

    enriched_positions = enrich_positions_by_vessel(
        positions,
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        minimum_minutes_of_emission_at_sea=-1,
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

    expected_enriched_positions["time_emitting_at_sea"] = [
        0 * td,
        0 * td,
        0 * td,
        1 * td,
        2 * td,
        13 * td,
        14 * td,
        15 * td,
        16 * td,
        17 * td,
    ]

    pd.testing.assert_frame_equal(enriched_positions, expected_enriched_positions)

    # Test with increased minimum_minutes_of_emission_at_sea
    enriched_positions = enrich_positions_by_vessel(
        positions,
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        minimum_minutes_of_emission_at_sea=int((1.5 * td).total_seconds() / 90),
    )

    expected_enriched_positions["is_fishing"] = [
        False,
        False,
        False,
        False,
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
            "time_emitting_at_sea",
        ]
    )

    enriched_positions = enrich_positions_by_vessel(
        positions,
        minimum_minutes_of_emission_at_sea=60,
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
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
            "time_emitting_at_sea": [None],
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
            "time_emitting_at_sea": [
                None,
                timedelta(hours=1),
                timedelta(hours=1),
                timedelta(minutes=45),
            ],
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
            is_fishing,
            time_emitting_at_sea
        FROM positions
        WHERE id IN (13632807, 13635518, 13638407, 13640935)
        ORDER BY id""",
    )

    expected_loaded_positions = pd.concat([positions_1, positions_2]).drop_duplicates(
        subset=["id"]
    )
    expected_loaded_positions.loc[
        expected_loaded_positions.id == 13632807, "time_emitting_at_sea"
    ] = timedelta(
        hours=10
    )  # From DB test data

    pd.testing.assert_frame_equal(
        expected_loaded_positions,
        loaded_positions,
        check_dtype=False,
    )

    period = Period(start=now - timedelta(hours=4), end=now - timedelta(hours=2))
    reset_positions.run(period)

    not_enriched_ids = read_query(
        "monitorfish_remote",
        "SELECT id FROM positions WHERE is_at_port IS NULL ORDER BY id",
    )["id"].tolist()

    assert not_enriched_ids == [
        13632807,
        13634205,
        13635518,
        13639642,
        13740935,
        13786523,
    ]

    positions_reset = read_query(
        "monitorfish_remote",
        """SELECT
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing,
            time_emitting_at_sea
        FROM positions
        WHERE id IN (13632807, 13634205, 13635518, 13639642)""",
    )

    assert positions_reset.isna().all().all()


def test_extract_enrich_load(reset_test_data):

    positions_before = read_query(
        "monitorfish_remote",
        """SELECT
            external_reference_number,
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing,
            time_emitting_at_sea
        FROM positions
        ORDER BY internal_reference_number, date_time""",
    )

    now = datetime.utcnow()
    period = Period(start=now - timedelta(hours=4, minutes=30), end=now)
    extract_enrich_load.run(
        period,
        minimum_consecutive_positions=2,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        minimum_minutes_of_emission_at_sea=60,
    )

    positions_after = read_query(
        "monitorfish_remote",
        """SELECT
            external_reference_number,
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing,
            time_emitting_at_sea
        FROM positions
        ORDER BY internal_reference_number, date_time""",
    )

    # The number of positions in the positions table should not change
    assert len(positions_after) == len(positions_before)
    assert len(positions_after) == 29

    # Positions outside of the selected Period should not be affected
    assert (
        positions_after.loc[positions_after.id == "13735518", "average_speed"] == 0.4
    ).all()

    # Positions inside of the selected Period should be updated
    assert (
        positions_after.loc[positions_after.id == "13740935", "average_speed"]
        == 1459.06
    ).all()

    # Positions for which the flow run yields null values should default to the value
    # previously in the table
    assert (
        positions_after.loc[
            positions_after.id == "13634205", "meters_from_previous_position"
        ]
        == 2050
    ).all()

    # Positions for which the flow run yields non null values should replace the value
    # previously in the table
    assert (
        positions_before.loc[
            positions_after.id == "13637054", "meters_from_previous_position"
        ]
        == 2050
    ).all()
    assert (
        positions_after.loc[
            positions_after.id == "13637054", "meters_from_previous_position"
        ]
        == 657.987
    ).all()

    # Check all meaningful columns values for fishing detection
    columns_to_check = [
        "id",
        "external_reference_number",
        "average_speed",
        "is_at_port",
        "time_emitting_at_sea",
        "is_fishing",
    ]

    expected_res = pd.DataFrame(
        columns=columns_to_check,
        data=[
            [13632385, "AS761555", 2.69, False, timedelta(days=1), True],
            [13633654, "AS761555", 2.69, False, timedelta(days=1, minutes=30), True],
            [13635013, "AS761555", 2.69, False, timedelta(days=1, hours=1), True],
            [
                13636534,
                "AS761555",
                2.69,
                False,
                timedelta(days=1, hours=1, minutes=30),
                True,
            ],
            [13637980, "AS761555", 2.69, False, timedelta(days=1, hours=2), True],
            [
                13639240,
                "AS761555",
                2.69,
                False,
                timedelta(days=1, hours=2, minutes=30),
                True,
            ],
            [13640592, "AS761555", 2.69, False, timedelta(days=1, hours=3), True],
            [
                13641745,
                "AS761555",
                2.69,
                False,
                timedelta(days=1, hours=3, minutes=30),
                None,
            ],
            [13634205, "RV348407", 1.107, False, timedelta(), False],
            [13637054, "RV348407", 0.355284, False, timedelta(hours=1), False],
            [13639642, "RV348407", 0.286178, False, timedelta(hours=2), True],
            [13786524, "RO237719", 2.690000, False, timedelta(days=1), True],
            [
                13786525,
                "RO237719",
                2.690000,
                False,
                timedelta(days=1, minutes=30),
                True,
            ],
            [13786526, "RO237719", 2.690000, False, timedelta(days=1, hours=1), True],
            [13786527, "RO237719", 2.690000, False, timedelta(days=1, hours=1), True],
            [13786528, "RO237719", 2.690000, False, timedelta(days=1, hours=1), True],
            [13786529, "RO237719", 2.690000, False, timedelta(days=1, hours=1), True],
            [13786530, "RO237719", 2.690000, False, timedelta(days=1, hours=1), True],
            [13786532, "RO237719", 2.690000, False, timedelta(days=1, hours=1), True],
            [13786531, "RO237719", 2.690000, True, timedelta(), False],
            [13632807, "RO237719", 0.000000, True, timedelta(), False],
            [13635518, "RO237719", 0.000000, True, timedelta(), False],
            [13638407, "RO237719", 0.000000, True, timedelta(), False],
            [13640935, "RO237719", 0.000000, True, timedelta(), False],
            [13786523, "OHMYGOSH", 0.7, None, timedelta(days=3, hours=12), True],
            [13732807, "ZZTOPACDC", 0.4, True, timedelta(days=3), False],
            [13735518, "ZZTOPACDC", 0.4, False, timedelta(days=3, hours=4), False],
            [13738407, "ZZTOPACDC", 0.4, False, timedelta(days=3, hours=8), False],
            [13740935, "ZZTOPACDC", 1459.06, True, timedelta(), False],
        ],
    )

    pd.testing.assert_frame_equal(expected_res, positions_after[columns_to_check])


def test_flow_does_not_recompute_all_when_not_asked_to(reset_test_data):

    # Vessel 'ABC000055481' has all its positions already enriched in the test_data
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

    flow.schedule = None
    state = flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=48 * 60,
        chunk_overlap_minutes=180,
        minimum_consecutive_positions=2,
        minimum_minutes_of_emission_at_sea=60,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        recompute_all=False,
    )

    assert state.is_successful()

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


def test_flow_recomputes_all_when_asked_to(reset_test_data):

    # Vessel 'ABC000055481' has all its positions already enriched in the test_data
    positions_before = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing,
            time_emitting_at_sea
        FROM positions
        WHERE internal_reference_number = 'ABC000055481'
        ORDER BY date_time""",
    )

    flow.schedule = None
    state = flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=48 * 60,
        chunk_overlap_minutes=180,
        minimum_consecutive_positions=2,
        minimum_minutes_of_emission_at_sea=60,
        min_fishing_speed_threshold=0.57,
        max_fishing_speed_threshold=4.5,
        recompute_all=True,
    )

    assert state.is_successful()

    positions_after = read_query(
        "monitorfish_remote",
        """SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            is_fishing,
            time_emitting_at_sea
        FROM positions
        WHERE internal_reference_number = 'ABC000055481'
        ORDER BY date_time""",
    )

    with pytest.raises(AssertionError):
        pd.testing.assert_frame_equal(positions_before, positions_after)

    columns_to_check = [
        "id",
        "is_at_port",
        "average_speed",
        "time_emitting_at_sea",
        "is_fishing",
    ]
    expected_res = pd.DataFrame(
        columns=columns_to_check,
        data=[
            [13632385, False, None, timedelta(), False],
            [13633654, False, 0.747199, timedelta(minutes=30), False],
            [13635013, False, 0.560395, timedelta(hours=1), False],
            [13636534, False, 0.559126, timedelta(hours=1, minutes=30), False],
            [13637980, False, 1.002370, timedelta(hours=2), True],
            [13639240, False, 0.600405, timedelta(hours=2, minutes=30), True],
            [13640592, False, 0.559129, timedelta(hours=3), False],
            [13641745, False, 1.351540, timedelta(hours=3, minutes=30), None],
        ],
    )
    pd.testing.assert_frame_equal(expected_res, positions_after[columns_to_check])


def test_flow_can_compute_in_chunks(reset_test_data):

    query = """
        SELECT
            id,
            is_at_port,
            meters_from_previous_position,
            time_since_previous_position,
            average_speed,
            time_emitting_at_sea,
            is_fishing
        FROM positions
        ORDER BY id
    """

    positions_before = read_query("monitorfish_remote", query)

    flow.schedule = None
    state = flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=30 * 60,
        chunk_overlap_minutes=6 * 60,
        minimum_consecutive_positions=2,
        minimum_minutes_of_emission_at_sea=60,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        recompute_all=True,
    )

    assert state.is_successful()

    positions_enriched_in_2_chunks = read_query("monitorfish_remote", query)

    flow.schedule = None
    state = flow.run(
        start_hours_ago=48,
        end_hours_ago=0,
        minutes_per_chunk=48 * 60,
        chunk_overlap_minutes=6 * 60,
        minimum_consecutive_positions=2,
        minimum_minutes_of_emission_at_sea=60,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        recompute_all=True,
    )

    assert state.is_successful()

    positions_enriched_in_1_chunk = read_query("monitorfish_remote", query)

    with pytest.raises(AssertionError):
        pd.testing.assert_frame_equal(positions_before, positions_enriched_in_2_chunks)

    pd.testing.assert_frame_equal(
        positions_enriched_in_1_chunk, positions_enriched_in_2_chunks
    )
