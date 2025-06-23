import pandas as pd
import pytest
from sqlalchemy import text

from config import TEST_DATA_LOCATION
from src.db_config import create_engine
from src.flows.recompute_controls_segments import (
    compute_controls_segments,
    extract_controls_catches,
    flow,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


@pytest.fixture
def controls_catches() -> pd.DataFrame:
    return pd.read_csv(TEST_DATA_LOCATION / "csv/controls_catches.csv")


@pytest.fixture
def controls_segments() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [1, 2, 3, 4, 5, 6, 7, 8, 9],
            "segments": [
                [
                    {"segment": "L", "segmentName": "Lines"},
                    {
                        "segment": "T8-9",
                        "segmentName": "Trawls areas 8 and 9 targeting demersal",
                    },
                ],
                [{"segment": "FT", "segmentName": "Freezer trawlers"}],
                [
                    {
                        "segment": "T8-9",
                        "segmentName": "Trawls areas 8 and 9 targeting demersal",
                    }
                ],
                [{"segment": "L HKE", "segmentName": "Lines targeting HKE"}],
                [],
                [
                    {
                        "segment": "T8-PEL",
                        "segmentName": "Trawls area 8 targeting pelagic",
                    }
                ],
                [{"segment": "L", "segmentName": "Lines"}],
                [
                    {"segment": "L", "segmentName": "Lines"},
                    {
                        "segment": "T8-9",
                        "segmentName": "Trawls areas 8 and 9 targeting demersal",
                    },
                ],
                [],
            ],
        }
    )


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
    assert controls_catches.control_id.nunique() == 25

    assert controls_catches.loc[3].to_dict() == {
        "catch_id": 4,
        "control_id": 1,
        "year": 2022,
        "fao_area": "27.8.a",
        "gear": "OTB",
        "mesh": 71.0,
        "species": "GHL",
        "scip_species_type": "DEMERSAL",
        "weight": 125.0,
        "vessel_type": "Navire polyvalent",
    }

    controls_catches = extract_controls_catches.run(
        year=2022, control_types=["SEA_CONTROL"]
    )
    assert len(controls_catches) == 18
    assert controls_catches.control_id.nunique() == 12
    controls_catches = extract_controls_catches.run(
        year=2022, control_types=["LAND_CONTROL"]
    )
    assert len(controls_catches) == 55
    assert controls_catches.control_id.nunique() == 13

    with pytest.raises(ValueError):
        extract_controls_catches.run(
            year=2022, control_types=["UNKNWOWN_CONTROL_TYPEZZZ"]
        )

    with pytest.raises(ValueError):
        extract_controls_catches.run(year="2022", control_types=["LAND_CONTROL"])

    with pytest.raises(ValueError):
        extract_controls_catches.run(year=2022, control_types="THIS_SHOULD_BE_A_LIST")


def test_compute_controls_segments(
    controls_catches, segments_of_year, controls_segments
):
    res = compute_controls_segments.run(controls_catches, segments_of_year)
    pd.testing.assert_frame_equal(res, controls_segments)


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
