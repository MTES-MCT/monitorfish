import datetime
import unittest

import numpy as np
import pandas as pd

from src.pipeline.flows.current_segments import (
    compute_current_segments,
    merge_segments_catches,
    unnest,
)


class TestCurrentSegmentsFlow(unittest.TestCase):
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
            columns=pd.Index(["segment", "gears", "fao_areas", "species"]),
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
                ["A", "DRB", "27.7", "SCE", 1, 1],
                ["A", None, "37", None, 1, 1],
                ["B", "OTM", "27.7.b.4", "HKE", 1, 2],
                ["B", "DRB", "27.7", "SCE", 1, 2],
                ["C", "OTM", None, "BFT", 1, 1],
                ["D", "OTB", "27.4", None, 1, 1],
                ["E", "PTB", None, None, 3, 1],
                ["F", None, None, "TUR", 1, 3],
            ],
            columns=[
                "segment",
                "gear",
                "fao_area",
                "species",
                "risk_factor",
                "control_priority_level",
            ],
        )

        vessels_catches = pd.DataFrame(
            data=[
                ["vessel_1", "DRB", "27.7.b", "SCE", 123.56],
                ["vessel_2", "PTB", "37.5", "TUR", 1231.4],
                ["vessel_3", "OTM", "27.7.b", "HKE", 1203.4],
                ["vessel_4", "OTM", "27.7.b.4", "HKE", 13.4],
                ["vessel_4", "OTB", "27.4.b.1", "HKE", 1234],
            ],
            columns=["cfr", "gear", "fao_area", "species", "weight"],
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

        self.assertEqual(res.loc["vessel_1", "control_priority_level"], 2)
        self.assertEqual(res.loc["vessel_2", "control_priority_level"], 3)
        self.assertEqual(res.loc["vessel_4", "control_priority_level"], 2)
        self.assertEqual(res.loc["vessel_1", "risk_factor"], 1)
        self.assertEqual(res.loc["vessel_2", "risk_factor"], 3)
        self.assertEqual(res.loc["vessel_4", "risk_factor"], 1)

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
                    "fao_area",
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
            columns=pd.Index(
                [
                    "cfr",
                    "segments",
                    "total_weight_onboard",
                    "risk_factor",
                    "control_priority_level",
                ]
            ),
            data=[
                ["Vessel_A", np.array(["Segment 1", "Segment 2"]), 249.06, 2, 3],
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
                "risk_factor",
                "control_priority_level",
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
                2,
                3,
            ],
            [
                "Vessel_B",
                datetime.datetime(2020, 12, 3, 15, 58, 21),
                datetime.datetime(2020, 12, 3, 15, 56, 21),
                20200053.0,
                [{"gear": "OTM", "mesh": 70.0, "dimensions": 45.0}],
                np.nan,
                0.0,
                1,
                1,
            ],
        ]

        self.assertTrue((expected_segments[0] == res.loc[0, "segments"]).all())
        self.assertEqual(
            res.drop(columns=["segments"]).values.tolist(), expected_other_values
        )
