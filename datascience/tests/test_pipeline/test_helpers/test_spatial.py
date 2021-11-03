import unittest

import pandas as pd

from src.pipeline.helpers.spatial import get_h3_indices


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
