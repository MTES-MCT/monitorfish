import datetime
import unittest

import numpy as np
import pandas as pd

from src.pipeline.flows.current_segments import (
    catch_zone_isin_fao_zone,
    compute_current_segments,
    merge_segments_catches,
    unnest,
)


class TestCurrentSegmentsFlow(unittest.TestCase):
    def test_catch_zone_isin_fao_zone(self):
        self.assertTrue(catch_zone_isin_fao_zone("27", "27"))
        self.assertTrue(catch_zone_isin_fao_zone("27.7", "27"))
        self.assertTrue(catch_zone_isin_fao_zone("27.7", None))
        self.assertFalse(catch_zone_isin_fao_zone(None, "27.7"))
        self.assertFalse(catch_zone_isin_fao_zone("27", "27.7"))

        self.assertTrue(catch_zone_isin_fao_zone(None, None))

    def test_unnest(self):
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
            columns=pd.Index(["segment", "gears", "fao_zones", "species"]),
        )

        res = unnest.run(segments)

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
                ["vessel_1", "DRB", "27.7.b", "SCE", 123.56],
                ["vessel_2", "PTB", "37.5", "TUR", 1231.4],
                ["vessel_3", "OTM", "27.7.b", "HKE", 1203.4],
                ["vessel_4", "OTM", "27.7.b.4", "HKE", 13.4],
                ["vessel_4", "OTB", "27.4.b.1", "HKE", 1234],
            ],
            columns=["cfr", "gear", "fao_zone", "species", "weight"],
        )

        res = compute_current_segments.run(vessels_catches, segments_definitions)

        expected_segments = {
            "vessel_1": {"A", "B"},
            "vessel_2": {"A", "E", "F"},
            "vessel_4": {"B", "D"},
        }

        self.assertEqual(set(res.index), set(expected_segments.keys()))

        self.assertEqual(
            set(res.loc["vessel_1", "segments"]), set(expected_segments["vessel_1"])
        )

        self.assertEqual(
            set(res.loc["vessel_2", "segments"]), set(expected_segments["vessel_2"])
        )

        self.assertEqual(
            set(res.loc["vessel_4", "segments"]), set(expected_segments["vessel_4"])
        )

    def test_merge_segments_catches(self):
        catches = pd.DataFrame(
            columns=pd.Index(
                [
                    "cfr",
                    "last_ers_datetime_utc",
                    "departure_datetime_utc",
                    "trip_number",
                    "gear_onboard",
                    "species",
                    "gear",
                    "fao_zone",
                    "weight",
                ]
            ),
            data=[
                [
                    "Vessel_A",
                    datetime.datetime(2021, 2, 3, 13, 58, 21),
                    datetime.datetime(2021, 2, 3, 13, 56, 21),
                    20210003.0,
                    [{"gear": "OTB", "mesh": 70.0, "dimensions": 45.0}],
                    "BLI",
                    "OTB",
                    "27.8.b",
                    13.46,
                ],
                [
                    "Vessel_A",
                    datetime.datetime(2021, 2, 3, 13, 58, 21),
                    datetime.datetime(2021, 2, 3, 13, 56, 21),
                    20210003.0,
                    [{"gear": "OTB", "mesh": 70.0, "dimensions": 45.0}],
                    "HKE",
                    "OTB",
                    "27.8.c",
                    235.6,
                ],
                [
                    "Vessel_B",
                    datetime.datetime(2020, 12, 3, 15, 58, 21),
                    datetime.datetime(2020, 12, 3, 15, 56, 21),
                    20200053.0,
                    [{"gear": "OTM", "mesh": 70.0, "dimensions": 45.0}],
                    None,
                    None,
                    None,
                    np.nan,
                ],
            ],
        )

        current_segments = pd.DataFrame(
            columns=pd.Index(["cfr", "segments", "total_weight_onboard"]),
            data=[
                ["Vessel_A", np.array(["Segment 1", "Segment 2"]), 249.06],
            ],
        ).set_index("cfr")

        res = merge_segments_catches.run(catches, current_segments)

        self.assertEqual(
            list(res),
            [
                "cfr",
                "last_ers_datetime_utc",
                "departure_datetime_utc",
                "trip_number",
                "gear_onboard",
                "species_onboard",
                "segments",
                "total_weight_onboard",
            ],
        )

        expected_segments = [np.array(["Segment 1", "Segment 2"]), np.nan]

        expected_other_values = [
            [
                "Vessel_A",
                datetime.datetime(2021, 2, 3, 13, 58, 21),
                datetime.datetime(2021, 2, 3, 13, 56, 21),
                20210003.0,
                [{"gear": "OTB", "mesh": 70.0, "dimensions": 45.0}],
                [
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.b",
                        "species": "BLI",
                        "weight": 13.46,
                    },
                    {
                        "gear": "OTB",
                        "faoZone": "27.8.c",
                        "species": "HKE",
                        "weight": 235.6,
                    },
                ],
                249.06,
            ],
            [
                "Vessel_B",
                datetime.datetime(2020, 12, 3, 15, 58, 21),
                datetime.datetime(2020, 12, 3, 15, 56, 21),
                20200053.0,
                [{"gear": "OTM", "mesh": 70.0, "dimensions": 45.0}],
                np.nan,
                0.0,
            ],
        ]

        self.assertTrue((expected_segments[0] == res.loc[0, "segments"]).all())
        self.assertEqual(
            res.drop(columns=["segments"]).values.tolist(), expected_other_values
        )
