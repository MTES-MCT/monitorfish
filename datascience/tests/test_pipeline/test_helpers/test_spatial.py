from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import pytest

from src.pipeline.helpers.spatial import (
    Position,
    PositionRepresentation,
    compute_movement_metrics,
    coordinate_to_dms,
    detect_fishing_activity,
    enrich_positions,
    get_h3_indices,
    get_step_distances,
    position_to_position_representation,
)


def test_get_h3_indices():

    df = pd.DataFrame(
        {"latitude": [45.0256, -45.6987], "longitude": [1.2369, -1.2365]},
        index=[1, 129],
    )

    h3_cells = get_h3_indices(df, lat="latitude", lon="longitude", resolution=9)

    expected_h3_cells = pd.Series(
        data=["89186928383ffff", "89d19541dbbffff"], index=[1, 129]
    )

    pd.testing.assert_series_equal(h3_cells, expected_h3_cells)

    # Test with empty DataFrame
    df = pd.DataFrame(
        {"latitude": [], "longitude": []},
    )

    h3_cells = get_h3_indices(df, lat="latitude", lon="longitude", resolution=9)

    expected_h3_cells = pd.Series([], dtype=object)

    pd.testing.assert_series_equal(h3_cells, expected_h3_cells)


def test_get_step_distances():

    positions = pd.DataFrame(
        {"latitude": [45, 45.1, 45.2, 45.2], "longitude": [-4, -4.5, -4, -4]}
    )

    distances_1 = get_step_distances(positions)
    distances_2 = get_step_distances(positions, how="forward", unit="km")
    distances_3 = get_step_distances(positions.head(0))
    distances_4 = get_step_distances(positions.head(1))

    expected_distances_1 = np.array([np.nan, 40822.56593944, 40756.43460827, 0.0])
    expected_distances_2 = np.array([40.82256593944, 40.75643460827, 0.0, np.nan])
    expected_distances_3 = np.array([])
    expected_distances_4 = np.array([np.nan])

    np.testing.assert_almost_equal(distances_1, expected_distances_1)
    np.testing.assert_almost_equal(distances_2, expected_distances_2)
    np.testing.assert_almost_equal(distances_3, expected_distances_3)
    np.testing.assert_almost_equal(distances_4, expected_distances_4)


def test_compute_movement_metrics_on_port_exits_with_no_time_emitting_at_sea_data():
    positions = pd.DataFrame(
        data=[
            [45.2, -4.56, datetime(2021, 10, 2, 10, 23, 0), True, pd.NaT],
            [45.2, -4.56, datetime(2021, 10, 2, 11, 23, 0), True, pd.NaT],
            [45.2, -4.56, datetime(2021, 10, 2, 12, 23, 0), False, pd.NaT],
            [45.25, -4.36, datetime(2021, 10, 2, 13, 23, 0), False, pd.NaT],
            [45.32, -4.16, datetime(2021, 10, 2, 14, 23, 0), False, pd.NaT],
            [45.41, -4.07, datetime(2021, 10, 2, 15, 23, 0), False, pd.NaT],
        ],
        columns=pd.Index(
            [
                "latitude",
                "longitude",
                "datetime_utc",
                "is_at_port",
                "time_emitting_at_sea",
            ]
        ),
    )

    res = compute_movement_metrics(
        positions,
        lat="latitude",
        lon="longitude",
        datetime_column="datetime_utc",
        is_at_port_column="is_at_port",
        time_emitting_at_sea_column="time_emitting_at_sea",
    )

    expected_res = positions.copy(deep=True)
    expected_res["meters_from_previous_position"] = [
        np.nan,
        0.0,
        0.0,
        16620.929159452244,
        17476.033442064247,
        12230.645466780992,
    ]
    expected_res["time_since_previous_position"] = [
        None,
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
    ]
    expected_res["average_speed"] = [
        np.nan,
        0.0,
        0.0,
        8.97458377940186,
        9.436303154462337,
        6.6040202304433,
    ]

    expected_res["time_emitting_at_sea"] = [
        timedelta(hours=0),
        timedelta(hours=0),
        timedelta(hours=0),
        timedelta(hours=1),
        timedelta(hours=2),
        timedelta(hours=3),
    ]

    pd.testing.assert_frame_equal(res, expected_res)


def test_compute_movement_metrics_at_sea_with_time_emitting_at_sea_data():
    positions = pd.DataFrame(
        data=[
            [
                45.2,
                -4.56,
                datetime(2021, 10, 2, 10, 23, 0),
                False,
                timedelta(days=1, hours=2),
            ],
            [
                45.2,
                -4.56,
                datetime(2021, 10, 2, 11, 23, 0),
                False,
                timedelta(days=1, hours=3),
            ],
            [45.2, -4.56, datetime(2021, 10, 2, 12, 23, 0), False, pd.NaT],
            [45.25, -4.36, datetime(2021, 10, 2, 13, 23, 0), False, pd.NaT],
            [45.32, -4.16, datetime(2021, 10, 2, 14, 23, 0), False, pd.NaT],
            [45.41, -4.07, datetime(2021, 10, 2, 15, 23, 0), False, pd.NaT],
        ],
        columns=pd.Index(
            [
                "latitude",
                "longitude",
                "datetime_utc",
                "is_at_port",
                "time_emitting_at_sea",
            ]
        ),
    )

    res = compute_movement_metrics(
        positions,
        lat="latitude",
        lon="longitude",
        datetime_column="datetime_utc",
        is_at_port_column="is_at_port",
        time_emitting_at_sea_column="time_emitting_at_sea",
    )

    expected_res = positions.copy(deep=True)
    expected_res["meters_from_previous_position"] = [
        np.nan,
        0.0,
        0.0,
        16620.929159452244,
        17476.033442064247,
        12230.645466780992,
    ]
    expected_res["time_since_previous_position"] = [
        None,
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
    ]
    expected_res["average_speed"] = [
        np.nan,
        0.0,
        0.0,
        8.97458377940186,
        9.436303154462337,
        6.6040202304433,
    ]

    expected_res["time_emitting_at_sea"] = [
        timedelta(days=1, hours=2),
        timedelta(days=1, hours=3),
        timedelta(days=1, hours=4),
        timedelta(days=1, hours=5),
        timedelta(days=1, hours=6),
        timedelta(days=1, hours=7),
    ]

    pd.testing.assert_frame_equal(res, expected_res)


def test_compute_movement_metrics_on_port_entry_with_time_emitting_at_sea_data():
    positions = pd.DataFrame(
        data=[
            [
                45.2,
                -4.56,
                datetime(2021, 10, 2, 10, 23, 0),
                False,
                timedelta(days=1, hours=2),
            ],
            [
                45.2,
                -4.56,
                datetime(2021, 10, 2, 11, 23, 0),
                False,
                timedelta(days=1, hours=3),
            ],
            [45.2, -4.56, datetime(2021, 10, 2, 12, 23, 0), False, pd.NaT],
            [45.25, -4.36, datetime(2021, 10, 2, 13, 23, 0), False, pd.NaT],
            [45.32, -4.16, datetime(2021, 10, 2, 14, 23, 0), True, pd.NaT],
            [45.41, -4.07, datetime(2021, 10, 2, 15, 23, 0), True, pd.NaT],
            [45.51, -4.17, datetime(2021, 10, 2, 16, 23, 0), False, pd.NaT],
            [45.53, -4.07, datetime(2021, 10, 2, 17, 23, 0), False, pd.NaT],
            [45.56, -4.02, datetime(2021, 10, 2, 18, 23, 0), False, pd.NaT],
            [45.82, -3.99, datetime(2021, 10, 2, 19, 23, 0), False, pd.NaT],
            [45.91, -3.85, datetime(2021, 10, 2, 20, 23, 0), False, pd.NaT],
        ],
        columns=pd.Index(
            [
                "latitude",
                "longitude",
                "datetime_utc",
                "is_at_port",
                "time_emitting_at_sea",
            ]
        ),
    )

    res = compute_movement_metrics(
        positions,
        lat="latitude",
        lon="longitude",
        datetime_column="datetime_utc",
        is_at_port_column="is_at_port",
        time_emitting_at_sea_column="time_emitting_at_sea",
    )

    expected_res = positions.copy(deep=True)
    expected_res["meters_from_previous_position"] = [
        np.nan,
        0.0,
        0.0,
        16620.929159452244,
        17476.033442064247,
        12230.645466780992,
        13582.06142259,
        8102.18076376,
        5127.31124037,
        29004.46986396,
        14753.42185709,
    ]
    expected_res["time_since_previous_position"] = [
        None,
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
    ]
    expected_res["average_speed"] = [
        np.nan,
        0.0,
        0.0,
        8.97458377940186,
        9.436303154462337,
        6.6040202304433,
        7.33372647,
        4.37482763,
        2.76852659,
        15.66116083,
        7.96621051,
    ]

    expected_res["time_emitting_at_sea"] = [
        timedelta(days=1, hours=2),
        timedelta(days=1, hours=3),
        timedelta(days=1, hours=4),
        timedelta(days=1, hours=5),
        timedelta(0),
        timedelta(0),
        timedelta(0),
        timedelta(hours=1),
        timedelta(hours=2),
        timedelta(hours=3),
        timedelta(hours=4),
    ]

    pd.testing.assert_frame_equal(res, expected_res)


def test_compute_movement_metrics_adds_new_columns_on_empty_input():

    input_columns = [
        "latitude",
        "longitude",
        "datetime_utc",
        "is_at_port",
        "time_emitting_at_sea",
    ]
    positions = pd.DataFrame(columns=pd.Index(input_columns))

    res = compute_movement_metrics(
        positions,
        lat="latitude",
        lon="longitude",
        datetime_column="datetime_utc",
        is_at_port_column="is_at_port",
        time_emitting_at_sea_column="time_emitting_at_sea_col",
    )

    added_columns = [
        "meters_from_previous_position",
        "time_since_previous_position",
        "average_speed",
    ]
    expected_res = positions = pd.DataFrame(
        columns=pd.Index(input_columns + added_columns)
    )

    pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)


def test_detect_fishing_activity_1():

    positions = pd.DataFrame(
        data=[
            [True, np.nan, timedelta()],
            [False, 1.3743995599575196, np.timedelta64()],
            [False, 3.4733394561194406, np.timedelta64(1, "h")],
            [False, 3.6471005850875398, np.timedelta64(2, "h")],
            [False, 1.01491998387466, np.timedelta64(3, "h")],
            [False, 2.657721803089177, np.timedelta64(4, "h")],
            [False, 1.0745565643325738, np.timedelta64(5, "h")],
            [False, 3.5526462712359184, np.timedelta64(6, "h")],
            [False, 0.47918612345236017, np.timedelta64(7, "h")],
            [False, 1.2016245937954306, np.timedelta64(8, "h")],
            [False, 0.46534727085138294, np.timedelta64(9, "h")],
            [False, 1.764707518758544, np.timedelta64(10, "h")],
            [False, 0.1768675527415563, np.timedelta64(11, "h")],
            [False, 3.185626122736285, np.timedelta64(12, "h")],
            [True, 0.03020495215890416, np.timedelta64()],
            [False, 3.32201017795906745, np.timedelta64()],
            [False, 7.9238776369607742, np.timedelta64(30, "m")],
            [False, 1.2368204841346149, np.timedelta64(90, "m")],
            [False, 3.238948073103732, np.timedelta64(150, "m")],
            [False, 0.32462967457964775, np.timedelta64(10, "m")],
        ],
        columns=pd.Index(["is_at_port", "average_speed", "time_emitting_at_sea"]),
    )

    positions_is_fishing = detect_fishing_activity(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(60, "m"),
        is_at_port_column="is_at_port",
        average_speed_column="average_speed",
        time_emitting_at_sea_column="time_emitting_at_sea",
        minimum_consecutive_positions=3,
        max_fishing_speed_threshold=4.5,
    )

    expected_positions_is_fishing = positions.copy(deep=True)
    expected_positions_is_fishing["is_fishing"] = [
        False,
        False,
        False,
        True,
        True,
        True,
        True,
        True,
        True,
        True,
        True,
        True,
        True,
        True,
        False,
        False,
        False,
        True,
        True,
        False,
    ]

    pd.testing.assert_frame_equal(positions_is_fishing, expected_positions_is_fishing)


def test_detect_fishing_activity_2():

    positions = pd.DataFrame(
        data=[
            [False, np.nan, np.timedelta64(30, "m")],
            [False, 1.3743995599575196, np.timedelta64(60, "m")],
            [False, 5.4733394561194406, np.timedelta64(60, "m")],
            [False, 3.6471005850875398, np.timedelta64(60, "m")],
            [False, 1.01491998387466, np.timedelta64(60, "m")],
            [False, 2.657721803089177, np.timedelta64(60, "m")],
            [False, 1.0745565643325738, np.timedelta64(60, "m")],
            [False, 3.5526462712359184, np.timedelta64(60, "m")],
            [False, 0.47918612345236017, np.timedelta64(60, "m")],
            [False, 1.2016245937954306, np.timedelta64(60, "m")],
            [False, 0.46534727085138294, np.timedelta64(60, "m")],
            [False, 1.764707518758544, np.timedelta64(60, "m")],
            [False, 1.1768675527415563, np.timedelta64(60, "m")],
            [False, 3.185626122736285, np.timedelta64(60, "m")],
            [True, 0.03020495215890416, np.timedelta64(60, "m")],
            [False, 3.32201017795906745, np.timedelta64(60, "m")],
            [False, 7.9238776369607742, np.timedelta64(60, "m")],
            [False, 1.2368204841346149, np.timedelta64(60, "m")],
            [False, 5.238948073103732, np.timedelta64(60, "m")],
            [False, 1.32462967457964775, np.timedelta64(60, "m")],
        ],
        columns=pd.Index(["is_at_port", "average_speed", "time_emitting_at_sea"]),
    )

    positions_is_fishing = detect_fishing_activity(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(40, "m"),
        is_at_port_column="is_at_port",
        average_speed_column="average_speed",
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.5,
        max_fishing_speed_threshold=4.5,
    )

    expected_positions_is_fishing = positions.copy(deep=True)
    expected_positions_is_fishing["is_fishing"] = [
        False,
        np.nan,
        False,
        True,
        True,
        True,
        True,
        True,
        False,
        False,
        False,
        True,
        True,
        True,
        False,
        False,
        False,
        False,
        False,
        np.nan,
    ]

    pd.testing.assert_frame_equal(positions_is_fishing, expected_positions_is_fishing)


def test_detect_fishing_activity_3():
    """
    This tests whether situations where there are only `NaN` values are correctly
    hanlded (which is not trivial given how pandas handles null values in the
    bool dtype).
    """
    positions = pd.DataFrame(
        data=[
            [False, np.nan, np.timedelta64(90, "m")],
            [False, 1.3743995599575196, np.timedelta64(50, "m")],
            [False, 3.4733394561194406, np.timedelta64(90, "m")],
        ],
        columns=pd.Index(["is_at_port", "average_speed", "time_emitting_at_sea"]),
    )

    positions_is_fishing = detect_fishing_activity(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(40, "m"),
        is_at_port_column="is_at_port",
        average_speed_column="average_speed",
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
    )

    expected_positions_is_fishing = positions.copy(deep=True)
    expected_positions_is_fishing["is_fishing"] = [
        np.nan,
        np.nan,
        np.nan,
    ]

    pd.testing.assert_frame_equal(positions_is_fishing, expected_positions_is_fishing)


def test_detect_fishing_activity_on_empty_input():
    positions = pd.DataFrame(
        {"is_at_port": [], "average_speed": [], "time_emitting_at_sea": []}
    )

    positions_is_fishing = detect_fishing_activity(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(40, "m"),
        is_at_port_column="is_at_port",
        average_speed_column="average_speed",
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
    )

    expected_positions_is_fishing = pd.DataFrame(
        {
            "is_at_port": [],
            "average_speed": [],
            "time_emitting_at_sea": [],
            "is_fishing": [],
        }
    )

    pd.testing.assert_frame_equal(
        positions_is_fishing, expected_positions_is_fishing, check_dtype=False
    )


def test_detect_fishing_activity_on_empty_input_and_return_floats():
    positions = pd.DataFrame(
        {"is_at_port": [], "average_speed": [], "time_emitting_at_sea": []}
    )

    positions_is_fishing = detect_fishing_activity(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(50, "m"),
        is_at_port_column="is_at_port",
        average_speed_column="average_speed",
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        return_floats=True,
    )

    expected_positions_is_fishing = pd.DataFrame(
        {
            "is_at_port": [],
            "average_speed": [],
            "time_emitting_at_sea": [],
            "is_fishing": [],
        }
    )

    pd.testing.assert_frame_equal(
        positions_is_fishing, expected_positions_is_fishing, check_dtype=False
    )


def test_detect_fishing_activity_5():

    positions = pd.DataFrame(
        data=[
            [False, np.nan, np.timedelta64(60, "m")],
            [False, 1.3743995599575196, np.timedelta64(60, "m")],
            [False, 3.4733394561194406, np.timedelta64(60, "m")],
            [False, 3.6471005850875398, np.timedelta64(40, "m")],
            [False, 1.01491998387466, np.timedelta64(60, "m")],
            [False, 2.657721803089177, np.timedelta64(40, "m")],
            [False, 1.0745565643325738, np.timedelta64(60, "m")],
            [False, 3.5526462712359184, np.timedelta64(60, "m")],
            [False, 0.47918612345236017, np.timedelta64(60, "m")],
            [False, 1.2016245937954306, np.timedelta64(60, "m")],
            [False, 0.46534727085138294, np.timedelta64(60, "m")],
            [False, 1.764707518758544, np.timedelta64(60, "m")],
            [False, 0.1768675527415563, np.timedelta64(60, "m")],
            [False, 3.185626122736285, np.timedelta64(60, "m")],
            [True, 0.03020495215890416, np.timedelta64(60, "m")],
            [False, 3.32201017795906745, np.timedelta64(60, "m")],
            [False, 7.9238776369607742, np.timedelta64(60, "m")],
            [False, 1.2368204841346149, np.timedelta64(60, "m")],
            [False, 5.238948073103732, np.timedelta64(60, "m")],
            [False, 0.32462967457964775, np.timedelta64(60, "m")],
        ],
        columns=pd.Index(
            [
                "is_at_port",
                "average_speed",
                "time_emitting_at_sea",
            ]
        ),
    )

    positions_is_fishing = detect_fishing_activity(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(50, "m"),
        is_at_port_column="is_at_port",
        average_speed_column="average_speed",
        minimum_consecutive_positions=3,
        min_fishing_speed_threshold=0.1,
        max_fishing_speed_threshold=4.5,
        return_floats=True,
    )

    expected_positions_is_fishing = positions.copy(deep=True)
    expected_positions_is_fishing["is_fishing"] = [
        np.nan,
        1.0,
        1.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        0.0,
        np.nan,
    ]

    pd.testing.assert_frame_equal(positions_is_fishing, expected_positions_is_fishing)


def test_enrich_positions():
    positions = pd.DataFrame(
        data=[
            [45.2, -4.56, datetime(2021, 10, 2, 10, 23, 0), True, pd.NaT],
            [45.2, -4.56, datetime(2021, 10, 2, 11, 23, 0), True, pd.NaT],
            [45.2, -4.56, datetime(2021, 10, 2, 12, 23, 0), True, pd.NaT],
            [45.25, -4.36, datetime(2021, 10, 2, 13, 23, 0), False, pd.NaT],
            [45.32, -4.16, datetime(2021, 10, 2, 15, 23, 0), False, pd.NaT],
            [45.41, -4.07, datetime(2021, 10, 2, 16, 23, 0), False, pd.NaT],
            [45.50, -3.98, datetime(2021, 10, 2, 17, 23, 0), False, pd.NaT],
        ],
        columns=pd.Index(
            [
                "latitude",
                "longitude",
                "datetime_utc",
                "is_at_port",
                "time_emitting_at_sea",
            ]
        ),
    )

    res = enrich_positions(
        positions, minimum_time_of_emission_at_sea=np.timedelta64(60, "m")
    )

    expected_res = positions.copy(deep=True)

    expected_res["meters_from_previous_position"] = [
        np.nan,
        0.0,
        0.0,
        16620.929159452244,
        17476.033442064247,
        12230.645466780992,
        12224.213168378628,
    ]

    expected_res["time_since_previous_position"] = [
        None,
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=1),
        timedelta(hours=2),
        timedelta(hours=1),
        timedelta(hours=1),
    ]

    expected_res["average_speed"] = [
        np.nan,
        0.0,
        0.0,
        8.97458377940186,
        4.718151577231168,
        6.6040202304433,
        6.600547067159087,
    ]

    expected_res["is_fishing"] = [False, False, False, False, False, False, False]

    expected_res["time_emitting_at_sea"] = [
        timedelta(hours=0),
        timedelta(hours=0),
        timedelta(hours=0),
        timedelta(hours=0),
        timedelta(hours=2),
        timedelta(hours=3),
        timedelta(hours=4),
    ]

    pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

    # Test non default arguments

    res = enrich_positions(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(60, "m"),
        minimum_consecutive_positions=2,
        max_fishing_speed_threshold=7.1,
    )

    expected_res.loc[4, "is_fishing"] = True
    expected_res.loc[5, "is_fishing"] = True
    expected_res.loc[6, "is_fishing"] = True
    pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

    res = enrich_positions(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(150, "m"),
        minimum_consecutive_positions=2,
        max_fishing_speed_threshold=7.1,
    )

    expected_res.loc[4, "is_fishing"] = False
    pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

    res = enrich_positions(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(60, "m"),
        minimum_consecutive_positions=4,
        max_fishing_speed_threshold=7.1,
    )

    expected_res["is_fishing"] = [False, False, False, False, np.nan, np.nan, np.nan]

    pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

    res = enrich_positions(
        positions,
        minimum_time_of_emission_at_sea=np.timedelta64(60, "m"),
        minimum_consecutive_positions=2,
        min_fishing_speed_threshold=5.0,
        max_fishing_speed_threshold=7.1,
    )

    expected_res["is_fishing"] = [False, False, False, False, False, True, True]

    pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)


def test_enrich_positions_empty_input():
    positions = pd.DataFrame(
        data=[],
        columns=pd.Index(
            [
                "latitude",
                "longitude",
                "datetime_utc",
                "is_at_port",
                "time_emitting_at_sea",
            ]
        ),
    )

    res = enrich_positions(positions, minimum_time_of_emission_at_sea=np.timedelta64)

    expected_res = pd.DataFrame(
        data=[],
        columns=pd.Index(
            [
                "latitude",
                "longitude",
                "datetime_utc",
                "is_at_port",
                "time_emitting_at_sea",
                "meters_from_previous_position",
                "time_since_previous_position",
                "average_speed",
                "is_fishing",
            ]
        ),
    )

    pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)


def test_coordinate_to_dms():
    assert coordinate_to_dms(45.123) == (45, 7.379999999999853, 7, 23)
    assert coordinate_to_dms(-45.123) == (45, 7.379999999999853, 7, 23)


def test_position_to_position_representation():
    p = Position(latitude=45.123, longitude=-45.123)
    dms = position_to_position_representation(p, representation_type="DMS")
    dmd = position_to_position_representation(p, representation_type="DMD")

    assert dms == PositionRepresentation(
        latitude="45° 07' 23'' N", longitude="045° 07' 23'' W"
    )
    assert dmd == PositionRepresentation(
        latitude="45° 07.380' N", longitude="045° 07.380' W"
    )

    p = Position(latitude=-5.523, longitude=165.89634)
    dms = position_to_position_representation(p, representation_type="DMS")
    dmd = position_to_position_representation(p, representation_type="DMD")

    assert dms == PositionRepresentation(
        latitude="05° 31' 23'' S", longitude="165° 53' 47'' E"
    )
    assert dmd == PositionRepresentation(
        latitude="05° 31.380' S", longitude="165° 53.780' E"
    )

    with pytest.raises(ValueError):
        position_to_position_representation(p, representation_type="unknown")

    with pytest.raises(ValueError):
        p = Position(latitude=92.236, longitude=-45.123)
        position_to_position_representation(p, representation_type="DMD")

    with pytest.raises(ValueError):
        p = Position(latitude=2.123, longitude=-186.589)
        position_to_position_representation(p, representation_type="DMD")
