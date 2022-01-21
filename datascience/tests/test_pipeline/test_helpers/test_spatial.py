import unittest
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

from src.pipeline.helpers.spatial import (
    compute_movement_metrics,
    detect_fishing_activity,
    enrich_positions,
    get_h3_indices,
    get_step_distances,
)


class TestHelpersSpatial(unittest.TestCase):
    def test_get_h3_indices(self):

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

    def test_get_step_distances(self):

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

    def test_compute_movement_metrics_1(self):
        positions = pd.DataFrame(
            data=[
                [45.2, -4.56, datetime(2021, 10, 2, 10, 23, 0)],
                [45.2, -4.56, datetime(2021, 10, 2, 11, 23, 0)],
                [45.2, -4.56, datetime(2021, 10, 2, 12, 23, 0)],
                [45.25, -4.36, datetime(2021, 10, 2, 13, 23, 0)],
                [45.32, -4.16, datetime(2021, 10, 2, 14, 23, 0)],
                [45.41, -4.07, datetime(2021, 10, 2, 15, 23, 0)],
            ],
            columns=pd.Index(
                [
                    "latitude",
                    "longitude",
                    "datetime_utc",
                ]
            ),
        )

        res = compute_movement_metrics(positions)

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

        pd.testing.assert_frame_equal(res, expected_res)

    def test_compute_movement_metrics_2(self):

        input_columns = ["latitude", "longitude", "datetime_utc"]
        positions = pd.DataFrame(columns=pd.Index(input_columns))

        res = compute_movement_metrics(positions)

        added_columns = [
            "meters_from_previous_position",
            "time_since_previous_position",
            "average_speed",
        ]
        expected_res = positions = pd.DataFrame(
            columns=pd.Index(input_columns + added_columns)
        )

        pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

    def test_detect_fishing_activity_1(self):

        positions = pd.DataFrame(
            data=[
                [True, np.nan],
                [False, 1.3743995599575196],
                [False, 3.4733394561194406],
                [False, 3.6471005850875398],
                [False, 1.01491998387466],
                [False, 2.657721803089177],
                [False, 1.0745565643325738],
                [False, 3.5526462712359184],
                [False, 0.47918612345236017],
                [False, 1.2016245937954306],
                [False, 0.46534727085138294],
                [False, 1.764707518758544],
                [False, 0.1768675527415563],
                [False, 3.185626122736285],
                [True, 0.03020495215890416],
                [False, 3.32201017795906745],
                [False, 7.9238776369607742],
                [False, 1.2368204841346149],
                [False, 3.238948073103732],
                [False, 0.32462967457964775],
            ],
            columns=pd.Index(
                [
                    "is_at_port",
                    "average_speed",
                ]
            ),
        )

        positions_is_fishing = detect_fishing_activity(
            positions,
            is_at_port_column="is_at_port",
            average_speed_column="average_speed",
            minimum_consecutive_positions=3,
            fishing_speed_threshold=4.5,
        )

        expected_positions_is_fishing = positions.copy(deep=True)
        expected_positions_is_fishing["is_fishing"] = [
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
            True,
            True,
            False,
            False,
            False,
            True,
            True,
            True,
        ]

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing
        )

    def test_detect_fishing_activity_2(self):

        positions = pd.DataFrame(
            data=[
                [False, np.nan],
                [False, 1.3743995599575196],
                [False, 5.4733394561194406],
                [False, 3.6471005850875398],
                [False, 1.01491998387466],
                [False, 2.657721803089177],
                [False, 1.0745565643325738],
                [False, 3.5526462712359184],
                [False, 0.47918612345236017],
                [False, 1.2016245937954306],
                [False, 0.46534727085138294],
                [False, 1.764707518758544],
                [False, 0.1768675527415563],
                [False, 3.185626122736285],
                [True, 0.03020495215890416],
                [False, 3.32201017795906745],
                [False, 7.9238776369607742],
                [False, 1.2368204841346149],
                [False, 5.238948073103732],
                [False, 0.32462967457964775],
            ],
            columns=pd.Index(
                [
                    "is_at_port",
                    "average_speed",
                ]
            ),
        )

        positions_is_fishing = detect_fishing_activity(
            positions,
            is_at_port_column="is_at_port",
            average_speed_column="average_speed",
            minimum_consecutive_positions=3,
            fishing_speed_threshold=4.5,
        )

        expected_positions_is_fishing = positions.copy(deep=True)
        expected_positions_is_fishing["is_fishing"] = [
            np.nan,
            np.nan,
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
            False,
            False,
            np.nan,
        ]

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing
        )

    def test_detect_fishing_activity_3(self):
        """
        This tests whether situations where there are only `NaN` values are correctly
        hanlded (which is not trivial given how pandas handles null values in the
        bool dtype).
        """
        positions = pd.DataFrame(
            data=[
                [False, np.nan],
                [False, 1.3743995599575196],
                [False, 3.4733394561194406],
            ],
            columns=pd.Index(
                [
                    "is_at_port",
                    "average_speed",
                ]
            ),
        )

        positions_is_fishing = detect_fishing_activity(
            positions,
            is_at_port_column="is_at_port",
            average_speed_column="average_speed",
            minimum_consecutive_positions=3,
            fishing_speed_threshold=4.5,
        )

        expected_positions_is_fishing = positions.copy(deep=True)
        expected_positions_is_fishing["is_fishing"] = [
            np.nan,
            np.nan,
            np.nan,
        ]

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing
        )

    def test_detect_fishing_activity_4(self):
        positions = pd.DataFrame({"is_at_port": [], "average_speed": []})

        positions_is_fishing = detect_fishing_activity(
            positions,
            is_at_port_column="is_at_port",
            average_speed_column="average_speed",
            minimum_consecutive_positions=3,
            fishing_speed_threshold=4.5,
        )

        expected_positions_is_fishing = pd.DataFrame(
            {"is_at_port": [], "average_speed": [], "is_fishing": []}
        )

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing, check_dtype=False
        )

    def test_detect_fishing_activity_5(self):

        positions = pd.DataFrame(
            data=[
                [False, np.nan],
                [False, 1.3743995599575196],
                [False, 3.4733394561194406],
                [False, 3.6471005850875398],
                [False, 1.01491998387466],
                [False, 2.657721803089177],
                [False, 1.0745565643325738],
                [False, 3.5526462712359184],
                [False, 0.47918612345236017],
                [False, 1.2016245937954306],
                [False, 0.46534727085138294],
                [False, 1.764707518758544],
                [False, 0.1768675527415563],
                [False, 3.185626122736285],
                [True, 0.03020495215890416],
                [False, 3.32201017795906745],
                [False, 7.9238776369607742],
                [False, 1.2368204841346149],
                [False, 5.238948073103732],
                [False, 0.32462967457964775],
            ],
            columns=pd.Index(
                [
                    "is_at_port",
                    "average_speed",
                ]
            ),
        )

        positions_is_fishing = detect_fishing_activity(
            positions,
            is_at_port_column="is_at_port",
            average_speed_column="average_speed",
            minimum_consecutive_positions=3,
            fishing_speed_threshold=4.5,
            return_floats=True,
        )

        expected_positions_is_fishing = positions.copy(deep=True)
        expected_positions_is_fishing["is_fishing"] = [
            np.nan,
            1.0,
            1.0,
            1.0,
            1.0,
            1.0,
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

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing
        )

    def test_detect_fishing_activity_6(self):
        positions = pd.DataFrame({"is_at_port": [], "average_speed": []})

        positions_is_fishing = detect_fishing_activity(
            positions,
            is_at_port_column="is_at_port",
            average_speed_column="average_speed",
            minimum_consecutive_positions=3,
            fishing_speed_threshold=4.5,
            return_floats=True,
        )

        expected_positions_is_fishing = pd.DataFrame(
            {"is_at_port": [], "average_speed": [], "is_fishing": []}
        )

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing, check_dtype=False
        )

    def test_enrich_positions(self):
        positions = pd.DataFrame(
            data=[
                [45.2, -4.56, datetime(2021, 10, 2, 10, 23, 0), True],
                [45.2, -4.56, datetime(2021, 10, 2, 11, 23, 0), True],
                [45.2, -4.56, datetime(2021, 10, 2, 12, 23, 0), True],
                [45.25, -4.36, datetime(2021, 10, 2, 13, 23, 0), False],
                [45.32, -4.16, datetime(2021, 10, 2, 15, 23, 0), False],
                [45.41, -4.07, datetime(2021, 10, 2, 16, 23, 0), False],
            ],
            columns=pd.Index(
                [
                    "latitude",
                    "longitude",
                    "datetime_utc",
                    "is_at_port",
                ]
            ),
        )

        res = enrich_positions(positions)

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
            timedelta(hours=2),
            timedelta(hours=1),
        ]
        expected_res["average_speed"] = [
            np.nan,
            0.0,
            0.0,
            8.97458377940186,
            4.718151577231168,
            6.6040202304433,
        ]

        expected_res["is_fishing"] = [False, False, False, False, False, False]

        pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

        # Test non default arguments

        res = enrich_positions(
            positions, minimum_consecutive_positions=2, fishing_speed_threshold=7.1
        )

        expected_res.loc[4, "is_fishing"] = True
        expected_res.loc[5, "is_fishing"] = True
        pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

        res = enrich_positions(
            positions, minimum_consecutive_positions=4, fishing_speed_threshold=7.1
        )

        expected_res["is_fishing"] = [False, False, False, False, np.nan, np.nan]

        pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)

    def test_enrich_positions_empty_input(self):
        positions = pd.DataFrame(
            data=[],
            columns=pd.Index(
                [
                    "latitude",
                    "longitude",
                    "datetime_utc",
                    "is_at_port",
                ]
            ),
        )

        res = enrich_positions(positions)

        expected_res = pd.DataFrame(
            data=[],
            columns=pd.Index(
                [
                    "latitude",
                    "longitude",
                    "datetime_utc",
                    "is_at_port",
                    "meters_from_previous_position",
                    "time_since_previous_position",
                    "average_speed",
                    "is_fishing",
                ]
            ),
        )

        pd.testing.assert_frame_equal(res, expected_res, check_dtype=False)
