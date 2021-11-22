import unittest

import numpy as np
import pandas as pd

from src.pipeline.helpers.spatial import get_h3_indices, get_step_distances


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
