import unittest

import numpy as np
import pandas as pd

from src.pipeline.helpers.spatial import (
    detect_fishing_activity,
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

        expected_positions_is_fishing = expected_positions_is_fishing.astype(
            {"is_fishing": object}
        )

        pd.testing.assert_frame_equal(
            positions_is_fishing, expected_positions_is_fishing
        )

    def test_detect_fishing_activity_2(self):

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
        )

        expected_positions_is_fishing = positions.copy(deep=True)
        expected_positions_is_fishing["is_fishing"] = [
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
