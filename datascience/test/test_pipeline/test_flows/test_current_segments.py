import unittest

import pandas as pd

from src.pipeline.flows.current_segments import compute_current_segments


class TestCurrentSegmentsFlow(unittest.TestCase):
    def test_compute_current_segments(self):
        segments_definitions = pd.DataFrame(
            data=[
                ["A", "DRB", "27.7", "SCE"],
                ["A", None, "37", None],
                ["B", "OTM", "27.7.b.4", "HKE"],
                ["B", "DRB", "27.7", "SCE"],
                ["C", "OTM", None, "BFT"],
                ["D", "OTB", "27.4", None],
                ["E", "PTB", None, None],
                ["F", None, None, "TUR"],
            ],
            columns=["segment", "gear", "fao_zone", "species"],
        )

        vessels_catches = pd.DataFrame(
            data=[
                ["vessel_1", "DRB", "27.7.b", "SCE"],
                ["vessel_2", "PTB", "37.5", "TUR"],
                ["vessel_3", "OTM", "27.7.b", "HKE"],
                ["vessel_4", "OTM", "27.7.b.4", "HKE"],
                ["vessel_4", "OTB", "27.4.b.1", "HKE"],
            ],
            columns=["cfr", "gear", "fao_zone", "species"],
        )

        res = compute_current_segments.run(vessels_catches, segments_definitions)

        expected_segments = {
            "vessel_1": {"A", "B"},
            "vessel_2": {"A", "E", "F"},
            "vessel_4": {"B", "D"},
        }
        self.assertEquals(set(res.index), set(expected_segments.keys()))
        self.assertEquals(set(res.loc["vessel_1"]), set(expected_segments["vessel_1"]))
        self.assertEquals(set(res.loc["vessel_2"]), set(expected_segments["vessel_2"]))
        self.assertEquals(set(res.loc["vessel_4"]), set(expected_segments["vessel_4"]))
