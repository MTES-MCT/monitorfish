import datetime
import unittest
from unittest.mock import patch

import geopandas as gpd
import numpy as np
import pandas as pd
import sqlalchemy
from shapely.geometry import Polygon

from src.pipeline.flows.current_segments import (
    compute_control_priorities,
    compute_current_segments,
    compute_last_positions_facade,
    extract_catches,
    extract_control_priorities,
    extract_facade_areas,
    extract_last_positions,
    extract_segments,
    join,
    unnest_segments,
)
from tests.mocks import mock_extract_side_effect


class TestCurrentSegmentsFlow(unittest.TestCase):
    @patch("src.pipeline.flows.current_segments.extract")
    def test_extract_catches(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_catches.run()
        self.assertTrue(isinstance(query, sqlalchemy.sql.elements.TextClause))

    @patch("src.pipeline.flows.current_segments.extract")
    def test_extract_control_priorities(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_control_priorities.run()
        self.assertTrue(isinstance(query, sqlalchemy.sql.elements.TextClause))

    @patch("src.pipeline.flows.current_segments.extract")
    def test_extract_last_positions(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_last_positions.run()
        self.assertTrue(isinstance(query, sqlalchemy.sql.elements.TextClause))

    def test_compute_last_positions_facade(self):
        last_positions = gpd.GeoDataFrame(
            {
                "cfr": ["A", "B", "C"],
                "latitude": [45, 45.1, 45.2],
                "longitude": [-5, -5.1, -5.2],
            }
        )

        last_positions.geometry = gpd.points_from_xy(
            last_positions.longitude, last_positions.latitude, crs=4326
        )

        facade_areas = gpd.GeoDataFrame(
            {
                "facade": ["Facade 1"],
                "geometry": [
                    Polygon(
                        [
                            (-5.05, 45.05),
                            (0, 45.05),
                            (0, 0),
                            (0, 45.05),
                            (-5.05, 45.05),
                        ]
                    )
                ],
            },
            crs=4326,
        )

        last_positions_facade = compute_last_positions_facade.run(
            last_positions, facade_areas
        )

        expected_last_positions_facade = pd.DataFrame(
            {"cfr": ["A", "B", "C"], "facade": ["Facade 1", "Facade 1", None]}
        ).set_index("cfr")

        pd.testing.assert_frame_equal(
            last_positions_facade, expected_last_positions_facade
        )

    def test_compute_current_segments(self):
        segments_definitions = pd.DataFrame(
            data=[
                ["A", "DRB", "27.7", "SCE", 1.1],
                ["A", None, "37", None, 1.1],
                ["B", "OTM", "27.7.b.4", "HKE", 1],
                ["B", "DRB", "27.7", "SCE", 1],
                ["C", "OTM", None, "BFT", 1],
                ["D", "OTB", "27.4", None, 1],
                ["E", "PTB", None, None, 3],
                ["F", None, None, "TUR", 1],
            ],
            columns=[
                "segment",
                "gear",
                "fao_area",
                "species",
                "impact_risk_factor",
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

        expected_res = pd.DataFrame(
            data=[
                [["A", "B"], 123.56, "A", 1.1],
                [["E", "F", "A"], 1231.4, "E", 3.0],
                [None, 1203.4, None, None],
                [["B", "D"], 1247.4, "B", 1.0],
            ],
            columns=[
                "segments",
                "total_weight_onboard",
                "segment_highest_impact",
                "impact_risk_factor",
            ],
            index=pd.Index(
                data=[
                    "vessel_1",
                    "vessel_2",
                    "vessel_3",
                    "vessel_4",
                ],
                name="cfr",
            ),
        )

        pd.testing.assert_frame_equal(res, expected_res)

    def test_compute_control_priorities(self):
        current_segments = pd.DataFrame(
            {
                "cfr": ["Vessel 1", "Vessel 2", "Vessel 3"],
                "segments": [
                    ["Segment 1", "Segment 2"],
                    ["Segment 1", "Segment 3"],
                    None,
                ],
            }
        ).set_index("cfr")

        last_positions_facade = pd.DataFrame(
            {
                "cfr": ["Vessel 1", "Vessel 2", "Vessel 4"],
                "facade": [None, "Facade 2", "Facade 4"],
            }
        ).set_index("cfr")

        control_priorities = pd.DataFrame(
            {
                "segment": ["Segment 1", "Segment 3", "Segment 3"],
                "facade": ["Facade 2", "Facade 1", "Facade 2"],
                "control_priority_level": [1, 4, 3],
            }
        )

        control_priorities = compute_control_priorities.run(
            current_segments,
            last_positions_facade,
            control_priorities,
        )

        expected_control_priorities = pd.DataFrame(
            {
                "cfr": ["Vessel 2"],
                "segment_highest_priority": ["Segment 3"],
                "control_priority_level": [3],
            }
        ).set_index("cfr")

        pd.testing.assert_frame_equal(control_priorities, expected_control_priorities)

    def test_join(self):
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
                    "impact_risk_factor",
                ]
            ),
            data=[
                ["Vessel_A", np.array(["Segment 1", "Segment 2"]), 249.06, 2],
            ],
        ).set_index("cfr")

        control_priorities = pd.DataFrame(
            columns=pd.Index(
                [
                    "cfr",
                    "segment_highest_priority",
                    "control_priority_level",
                ]
            ),
            data=[
                ["Vessel_B", "Segment 2", 2],
            ],
        ).set_index("cfr")

        res = join.run(catches, current_segments, control_priorities)

        expected_res = pd.DataFrame(
            {
                "cfr": ["Vessel_A", "Vessel_B"],
                "last_ers_datetime_utc": [
                    datetime.datetime(2021, 2, 3, 13, 58, 21),
                    datetime.datetime(2020, 12, 3, 15, 58, 21),
                ],
                "departure_datetime_utc": [
                    datetime.datetime(2021, 2, 3, 13, 56, 21),
                    datetime.datetime(2020, 12, 3, 15, 56, 21),
                ],
                "trip_number": [20210003.0, 20200053.0],
                "gear_onboard": [
                    [{"gear": "OTB", "mesh": 70.0, "dimensions": 45.0}],
                    [{"gear": "OTM", "mesh": 70.0, "dimensions": 45.0}],
                ],
                "species_onboard": [
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
                    None,
                ],
                "segments": [["Segment 1", "Segment 2"], None],
                "total_weight_onboard": [249.06, 0.0],
                "impact_risk_factor": [2.0, 1.0],
                "segment_highest_priority": [None, "Segment 2"],
                "control_priority_level": [1.0, 2.0],
            }
        )

        pd.testing.assert_frame_equal(res, expected_res)
