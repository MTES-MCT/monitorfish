import unittest

import numpy as np
import pandas as pd

from src.pipeline.helpers.spatial import (
    detect_fishing_activity,
    get_h3_indices,
    get_step_distances,
    tag_port_movements,
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

    def test_tag_port_movements_unknown_entry(self):

        positions = pd.DataFrame(
            {
                "some_data": [1, 2, "a", 2.36, 5, 6, 7, 8, 9],
                "is_at_port": [
                    True,
                    True,
                    True,
                    False,
                    False,
                    False,
                    True,
                    False,
                    False,
                ],
            }
        )

        res = tag_port_movements(positions)

        expected_res = positions.copy(deep=True)

        expected_res["is_port_exit"] = [
            False,
            False,
            True,
            False,
            False,
            False,
            True,
            False,
            False,
        ]

        expected_res["follows_port_exit"] = [
            False,
            False,
            False,
            True,
            False,
            False,
            False,
            True,
            False,
        ]

        expected_res["is_port_entry"] = [
            np.nan,
            False,
            False,
            False,
            False,
            False,
            True,
            False,
            False,
        ]

        expected_res["precedes_port_entry"] = [
            False,
            False,
            False,
            False,
            False,
            True,
            False,
            False,
            np.nan,
        ]

        expected_res = expected_res.astype(
            {
                "is_port_exit": "object",
                "is_port_entry": "object",
                "follows_port_exit": "object",
                "precedes_port_entry": "object",
            }
        )

        pd.testing.assert_frame_equal(res, expected_res)

    def test_tag_port_movements_unknown_exit(self):

        positions = pd.DataFrame(
            {
                "some_data": [1, 2, "a", 2.36, 5, 6, 7, 8, 9],
                "is_at_port": [
                    False,
                    True,
                    True,
                    False,
                    False,
                    False,
                    True,
                    True,
                    True,
                ],
            }
        )

        res = tag_port_movements(positions)

        expected_res = positions.copy(deep=True)

        expected_res["is_port_exit"] = [
            False,
            False,
            True,
            False,
            False,
            False,
            False,
            False,
            np.nan,
        ]

        expected_res["follows_port_exit"] = [
            np.nan,
            False,
            False,
            True,
            False,
            False,
            False,
            False,
            False,
        ]

        expected_res["is_port_entry"] = [
            False,
            True,
            False,
            False,
            False,
            False,
            True,
            False,
            False,
        ]

        expected_res["precedes_port_entry"] = [
            True,
            False,
            False,
            False,
            False,
            True,
            False,
            False,
            False,
        ]

        expected_res = expected_res.astype(
            {
                "is_port_exit": "object",
                "is_port_entry": "object",
                "follows_port_exit": "object",
                "precedes_port_entry": "object",
            }
        )

        pd.testing.assert_frame_equal(res, expected_res)

    def test_tag_port_movements_len_1(self):

        positions = pd.DataFrame(
            {
                "some_data": [2.36],
                "is_at_port": [False],
            }
        )

        res = tag_port_movements(positions)

        expected_res = positions.copy()

        expected_res["is_port_exit"] = [False]
        expected_res["follows_port_exit"] = [np.nan]
        expected_res["is_port_entry"] = [False]
        expected_res["precedes_port_entry"] = [np.nan]

        pd.testing.assert_frame_equal(res, expected_res)

    def test_tag_port_movements_len_1_unkown(self):

        positions = pd.DataFrame(
            {
                "some_data": [2.36],
                "is_at_port": [True],
            }
        )

        res = tag_port_movements(positions)

        expected_res = positions.copy()

        expected_res["is_port_exit"] = [np.nan]
        expected_res["follows_port_exit"] = [False]
        expected_res["is_port_entry"] = [np.nan]
        expected_res["precedes_port_entry"] = [False]

        pd.testing.assert_frame_equal(res, expected_res)

    def test_detect_fishing_activity(self):

        positions = pd.DataFrame(
            data=[
                [True, False, False, np.nan],
                [False, True, False, 1.3743995599575196],
                [False, False, False, 3.4733394561194406],
                [False, False, False, 3.6471005850875398],
                [False, False, False, 1.01491998387466],
                [False, False, False, 2.657721803089177],
                [False, False, False, 1.0745565643325738],
                [False, False, False, 3.5526462712359184],
                [False, False, False, 0.47918612345236017],
                [False, False, False, 1.2016245937954306],
                [False, False, False, 0.46534727085138294],
                [False, False, False, 1.764707518758544],
                [False, False, False, 0.1768675527415563],
                [False, False, True, 3.185626122736285],
                [True, False, False, 0.03020495215890416],
                [False, True, False, 0.32201017795906745],
                [False, False, False, 1.9238776369607742],
                [False, False, False, 1.2368204841346149],
                [False, False, False, 3.238948073103732],
                [False, False, False, 0.32462967457964775],
            ],
            columns=pd.Index(
                [
                    "is_at_port",
                    "follows_port_exit",
                    "precedes_port_entry",
                    "average_speed",
                ]
            ),
        )

        positions_is_fishing = detect_fishing_activity(
            positions,
            is_at_port_column="is_at_port",
            follows_port_exit_column="follows_port_exit",
            precedes_port_entry_column="precedes_port_entry",
            average_speed_column="average_speed",
            minimum_consecutive_positions=3,
            fishing_speed_threshold=4.5,
        )

        expected_positions_is_fishing = positions.copy(deep=True)
        expected_positions_is_fishing["is_fishing"] = [
            np.nan,
            np.nan,
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
            True,
        ]

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing
        )
