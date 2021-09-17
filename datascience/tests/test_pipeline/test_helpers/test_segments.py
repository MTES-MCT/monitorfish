import unittest
from unittest.mock import patch

import numpy as np
import pandas as pd

from src.pipeline.helpers.segments import (
    catch_area_isin_fao_area,
    extract_segments,
    unnest_segments,
)
from tests.mocks import mock_extract_side_effect


class TestHelpersSegments(unittest.TestCase):
    def test_unnest_segments(self):
        segments_definitions = [
            [
                "A",
                [
                    "OTB",
                    "OTT",
                ],
                ["27.8.c", "27.8"],
                ["HKE", "SOL"],
            ],
            ["B", ["SDN"], [], []],
            ["C", [], ["27.8.c"], []],
            ["D", [], [], ["HKE"]],
            ["E", ["LL"], None, None],
        ]

        segments = pd.DataFrame(
            data=segments_definitions,
            columns=pd.Index(["segment", "gears", "fao_areas", "species"]),
        )

        res = unnest_segments.run(segments)

        expected_values = [
            ["A", "OTB", "27.8.c", "HKE"],
            ["A", "OTB", "27.8.c", "SOL"],
            ["A", "OTB", "27.8", "HKE"],
            ["A", "OTB", "27.8", "SOL"],
            ["A", "OTT", "27.8.c", "HKE"],
            ["A", "OTT", "27.8.c", "SOL"],
            ["A", "OTT", "27.8", "HKE"],
            ["A", "OTT", "27.8", "SOL"],
            ["B", "SDN", np.nan, np.nan],
            ["C", np.nan, "27.8.c", np.nan],
            ["D", np.nan, np.nan, "HKE"],
            ["E", "LL", None, None],
        ]

        self.assertEqual(expected_values, res.values.tolist())

    def test_catch_area_isin_fao_area(self):
        self.assertTrue(catch_area_isin_fao_area("27", "27"))
        self.assertTrue(catch_area_isin_fao_area("27.7", "27"))
        self.assertTrue(catch_area_isin_fao_area("27.7", None))
        self.assertFalse(catch_area_isin_fao_area(None, "27.7"))
        self.assertFalse(catch_area_isin_fao_area("27", "27.7"))

        self.assertTrue(catch_area_isin_fao_area(None, None))
