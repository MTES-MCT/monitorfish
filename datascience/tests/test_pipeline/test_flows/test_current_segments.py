import datetime

import geopandas as gpd
import numpy as np
import pandas as pd
import pytest
from shapely.geometry import Polygon

from src.pipeline.flows.current_segments import (
    compute_control_priorities,
    compute_current_segments,
    compute_last_positions_facade,
    extract_catches,
    extract_control_priorities,
    extract_last_positions,
    flow,
    join,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def current_segments() -> pd.DataFrame:

    now = datetime.datetime.utcnow()
    return pd.DataFrame(
        {
            "cfr": ["ABC000306959", "ABC000542519"],
            "last_logbook_message_datetime_utc": [
                now - datetime.timedelta(days=1, hours=6),
                now - datetime.timedelta(weeks=1, days=3),
            ],
            "departure_datetime_utc": [
                datetime.datetime(2018, 2, 27, 1, 5),
                now - datetime.timedelta(weeks=1, days=5),
            ],
            "trip_number": ["20210001", "20210002"],
            "gear_onboard": [
                [{"gear": "OTM", "mesh": 80.0}],
                [{"gear": "OTB", "mesh": 80.0}],
            ],
            "species_onboard": [
                [
                    {
                        "gear": "OTM",
                        "weight": 713.0,
                        "faoZone": "27.8.a",
                        "species": "HKE",
                    }
                ],
                [
                    {
                        "gear": "OTB",
                        "weight": 157.0,
                        "faoZone": "27.8.c",
                        "species": "SOL",
                    },
                    {
                        "gear": "OTB",
                        "weight": 2426.0,
                        "faoZone": "27.8.c",
                        "species": "HKE",
                    },
                ],
            ],
            "segments": [["SWW04"], ["SWW01/02/03"]],
            "total_weight_onboard": [713.0, 2583.0],
            "probable_segments": [None, None],
            "impact_risk_factor": [2.1, 3.0],
            "control_priority_level": [1.0, 1.0],
            "segment_highest_impact": ["SWW04", "SWW01/02/03"],
            "segment_highest_priority": [None, None],
            "vessel_id": [1, 2],
            "external_immatriculation": ["RV348407", "RO237719"],
            "ircs": ["LLUK", "FQ7058"],
        }
    )


def test_extract_catches(reset_test_data):
    catches = extract_catches.run()
    assert len(catches) == 3
    assert set(catches.cfr) == {"ABC000542519", "ABC000306959"}
    assert set(catches.ircs) == {"LLUK", "FQ7058"}
    assert set(catches.loc[catches.cfr == "ABC000542519", "trip_number"]) == {
        "20210002"
    }
    assert catches.loc[
        (catches.cfr == "ABC000542519") & (catches.species == "HKE"), "weight"
    ].to_list() == [2426.0]


def test_extract_control_priorities(reset_test_data):
    control_priorities = extract_control_priorities.run()
    expected_control_priorities = pd.DataFrame(
        columns=["facade", "segment", "control_priority_level"],
        data=[["SA", "SWW01/02/03", 1.0], ["SA", "SWW04", 3.0]],
    )
    pd.testing.assert_frame_equal(control_priorities, expected_control_priorities)


def test_extract_last_positions(reset_test_data):
    last_positions = extract_last_positions.run()
    assert last_positions.crs.to_string() == "EPSG:4326"
    last_positions["geometry"] = last_positions["geometry"].map(str)
    expected_last_positions = pd.DataFrame(
        columns=["cfr", "latitude", "longitude", "geometry"],
        data=[
            ["ABC000055481", 53.435, 5.553, "POINT (5.553 53.435)"],
            ["ABC000542519", 43.324, 5.359, "POINT (5.359 43.324)"],
        ],
    )
    pd.testing.assert_frame_equal(last_positions, expected_last_positions)


def test_compute_last_positions_facade():
    last_positions = gpd.GeoDataFrame(
        {
            "cfr": ["A", "B", "C", "D"],
            "latitude": [45, 45, 45.1, 45],
            "longitude": [-5, -5.1, -5, -8],
        }
    )

    last_positions.geometry = gpd.points_from_xy(
        last_positions.longitude, last_positions.latitude, crs=4326
    )

    facade_areas = gpd.GeoDataFrame(
        {
            "facade": ["Facade 1", "Facade 1", "Facade 2"],
            "geometry": [
                Polygon(
                    [
                        (-5.05, 45.05),
                        (0, 45.05),
                        (0, 0),
                        (-5.05, 0),
                        (-5.05, 45.05),
                    ]
                ),
                Polygon(
                    [
                        (-5.15, 45.05),
                        (-7, 45.05),
                        (-7, 0),
                        (-5.15, 0),
                        (-5.15, 45.05),
                    ]
                ),
                Polygon(
                    [
                        (-5.05, 47),
                        (0, 47),
                        (0, 45.15),
                        (-5.05, 45.15),
                        (-5.05, 47),
                    ]
                ),
            ],
        },
        crs=4326,
    )

    last_positions_facade = compute_last_positions_facade.run(
        last_positions, facade_areas
    )

    # In the (rare) case where a ship is just outside the boundary of two nearby
    # facades, as is the case for ship C here, it must be attributed to one if the
    # facades, but without any guarantee on which one will be picked.

    expected_last_positions_facade_1 = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D"],
            "facade": ["Facade 1", "Facade 1", "Facade 2", None],
        }
    ).set_index("cfr")

    expected_last_positions_facade_2 = pd.DataFrame(
        {
            "cfr": ["A", "B", "C", "D"],
            "facade": ["Facade 1", "Facade 1", "Facade 1", None],
        }
    ).set_index("cfr")

    try:
        pd.testing.assert_frame_equal(
            last_positions_facade, expected_last_positions_facade_1
        )
    except AssertionError:
        pd.testing.assert_frame_equal(
            last_positions_facade, expected_last_positions_facade_2
        )


def test_compute_current_segments():
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


def test_compute_control_priorities():
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


def test_join():
    catches = pd.DataFrame(
        columns=pd.Index(
            [
                "cfr",
                "ircs",
                "external_immatriculation",
                "last_logbook_message_datetime_utc",
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
                "AA",
                "AAA",
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
                "AA",
                "AAA",
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
                None,
                "BBB",
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
            "ircs": ["AA", None],
            "external_immatriculation": ["AAA", "BBB"],
            "last_logbook_message_datetime_utc": [
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


def test_test_current_segments_flow(reset_test_data, current_segments):
    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    computed_current_segments = read_query(
        "SELECT * FROM current_segments ORDER BY cfr", db="monitorfish_remote"
    )
    datetime_columns = [
        "last_logbook_message_datetime_utc",
        "departure_datetime_utc",
    ]
    pd.testing.assert_frame_equal(
        current_segments.drop(columns=datetime_columns),
        computed_current_segments.drop(columns=datetime_columns),
    )

    assert (
        (
            (
                current_segments[datetime_columns]
                - computed_current_segments[datetime_columns]
            )
            < datetime.timedelta(seconds=10)
        )
        .all()
        .all()
    )
