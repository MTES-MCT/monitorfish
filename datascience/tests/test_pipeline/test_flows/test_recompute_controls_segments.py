import pandas as pd
import pytest
from sqlalchemy import text

from src.db_config import create_engine
from src.pipeline.flows.recompute_controls_segments import (
    compute_controls_segments,
    extract_controls_catches,
    flow,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def updated_controls_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [
                -199999,
                -144762,
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
            ],
            "segments": [
                [],
                [],
                [{"segment": "SWW01/02/03 - 2022", "segmentName": "Bottom trawls"}],
                [],
                [],
                [],
                [],
                [],
                [{"segment": "SWW01/02/03 - 2022", "segmentName": "Bottom trawls"}],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
                [],
            ],
        }
    )


def test_extract_controls_catches(reset_test_data):
    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(
            text(
                "UPDATE public.mission_actions "
                "SET action_datetime_utc = '2022-03-12 15:33'"
            )
        )
    controls_catches = extract_controls_catches.run(
        year=2022, control_types=["LAND_CONTROL", "SEA_CONTROL"]
    )
    assert len(controls_catches) == 73
    assert controls_catches.id.nunique() == 25
    controls_catches = extract_controls_catches.run(
        year=2022, control_types=["SEA_CONTROL"]
    )
    assert len(controls_catches) == 18
    assert controls_catches.id.nunique() == 12
    controls_catches = extract_controls_catches.run(
        year=2022, control_types=["LAND_CONTROL"]
    )
    assert len(controls_catches) == 55
    assert controls_catches.id.nunique() == 13

    with pytest.raises(ValueError):
        extract_controls_catches.run(
            year=2022, control_types=["UNKNWOWN_CONTROL_TYPEZZZ"]
        )

    with pytest.raises(ValueError):
        extract_controls_catches.run(year="2022", control_types=["LAND_CONTROL"])

    with pytest.raises(ValueError):
        extract_controls_catches.run(year=2022, control_types="THIS_SHOULD_BE_A_LIST")


def test_compute_controls_segments():
    segments = pd.DataFrame(
        data=[
            ["A", "AAA", "DRB", "27.7", "SCE", 1.1],
            ["A", "AAA", None, "37", None, 1.1],
            ["B", "BBB", "OTM", "27.7.b.4", "HKE", 1],
            ["B", "BBB", "DRB", "27.7", "SCE", 1],
            ["C", "CCC", "OTM", None, "BFT", 1],
            ["D", "DDD", "OTB", "27.4", None, 1],
            ["E", "EEE", "PTB", None, None, 3],
            ["F", "FFF", None, None, "TUR", 1],
        ],
        columns=[
            "segment",
            "segment_name",
            "gear",
            "fao_area",
            "species",
            "impact_risk_factor",
        ],
    )

    controls_catches = pd.DataFrame(
        data=[
            ["abc123", "DRB", "27.7.b", "SCE", 123.56],
            ["abc123", "PTB", "37.5", "TUR", 1231.4],
            ["def456", "OTM", "27.7.b", "HKE", 1203.4],
            ["ghi789", "OTM", "27.7.b.4", "HKE", 13.4],
            ["ghi789", "OTB", "27.4.b.1", "HKE", 1234],
        ],
        columns=["id", "gear", "fao_area", "species", "weight"],
    )

    res = compute_controls_segments.run(controls_catches, segments)

    expected_res = pd.DataFrame(
        {
            "id": ["abc123", "ghi789", "def456"],
            "segments": [
                [
                    {"segment": "A", "segmentName": "AAA"},
                    {"segment": "B", "segmentName": "BBB"},
                    {"segment": "E", "segmentName": "EEE"},
                    {"segment": "F", "segmentName": "FFF"},
                ],
                [
                    {"segment": "B", "segmentName": "BBB"},
                    {"segment": "D", "segmentName": "DDD"},
                ],
                [],
            ],
        }
    )

    pd.testing.assert_frame_equal(res, expected_res)


def test_recompute_controls_segments_flow(reset_test_data, updated_controls_segments):

    e = create_engine("monitorfish_remote")
    with e.begin() as connection:
        connection.execute(
            text(
                "UPDATE public.mission_actions "
                "SET action_datetime_utc = '2022-03-12 15:33'"
            )
        )

    flow.schedule = None

    land_controls_ids = {6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21, 22, 23}

    query = "SELECT id, segments FROM public.mission_actions ORDER BY id"

    initial_controls_segments = read_query(query, db="monitorfish_remote")

    # Running the flow on a year without data should not update any row
    state = flow.run(year=1950, control_types=["LAND_CONTROL", "SEA_CONTROL"])
    assert state.is_successful()
    controls_segments = read_query(query, db="monitorfish_remote")
    pd.testing.assert_frame_equal(controls_segments, initial_controls_segments)

    # Running the flow on land controls should update only land controls
    state = flow.run(year=2022, control_types=["LAND_CONTROL"])
    assert state.is_successful()
    controls_segments = read_query(query, db="monitorfish_remote")
    pd.testing.assert_frame_equal(
        controls_segments,
        pd.concat(
            [
                initial_controls_segments[
                    ~initial_controls_segments.id.isin(land_controls_ids)
                ],
                updated_controls_segments[
                    updated_controls_segments.id.isin(land_controls_ids)
                ],
            ]
        ).sort_values("id"),
    )

    # Running the flow on land and sea controls should update land and sea controls
    state = flow.run(year=2022, control_types=["LAND_CONTROL", "SEA_CONTROL"])
    assert state.is_successful()
    controls_segments = read_query(query, db="monitorfish_remote")
    pd.testing.assert_frame_equal(controls_segments, updated_controls_segments)
