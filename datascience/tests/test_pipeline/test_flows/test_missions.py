from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import sqlalchemy
from prefect import task

from src.pipeline.flows.missions import (
    extract_missions,
    extract_missions_control_units,
    flow,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_extract_side_effect

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)

d = datetime(2020, 5, 6, 12, 56, 2)
day = timedelta(days=1)
missions_df = pd.DataFrame(
    {
        "id": [1, 2, 112, 113],
        "mission_types": [["SEA"], ["LAND"], ["AIR", "SEA"], []],
        "facade": ["Facade 1", "Facade 1", "Facade 3", "Facade 4"],
        "start_datetime_utc": [
            d,
            d + 2 * day,
            d + 25 * day,
            d + 26 * day,
        ],
        "end_datetime_utc": [
            d + 0.5 * day,
            d + 2.5 * day,
            d + 26.8 * day,
            None,
        ],
        "geom": [
            "0106000020E610000001000000010300000001000000040000001EA36CE84A6F04C028FCC"
            "F619D7F47407B5A4C4F4F6904C06878344D997F4740906370C20E6A04C050111641647F47"
            "401EA36CE84A6F04C028FCCF619D7F4740",
            "0106000020E61000000100000001030000000100000004000000508B8D44B1B304C014238"
            "1B3F47F4740A374D56D789004C0C0F2BF049B7F474033F02B2558B104C0CCA0D40BEE7E47"
            "40508B8D44B1B304C0142381B3F47F4740",
            "0106000020E61000000100000001030000000100000004000000D2204A8709EBE33F541AC"
            "4E69B024940B8BC1FBE94F2E33F387D124AAF02494021642107D81FE43F387D124AAF0249"
            "40D2204A8709EBE33F541AC4E69B024940",
            "0106000020E61000000100000001030000000100000004000000F57994631533F2BFE2B98"
            "CD5455446407A715E737969F3BFEAD7CEDEB655464036ED5A29A137F4BF97F69352CC3446"
            "40F57994631533F2BFE2B98CD545544640",
        ],
        "deleted": [True, False, False, False],
        "mission_source": [
            "POSEIDON_CNSP",
            "POSEDION_CACEM",
            "MONITORENV",
            "MONITORFISH",
        ],
        "mission_order": [True, True, None, False],
    }
)

missions_control_units_df = pd.DataFrame(
    {
        "id": [100, 101, 102, 112, 999],
        "mission_id": [1, 1, 2, 112, 999],
        "control_unit_id": [8, 7, 6, 2, 2],
    }
)


@task(checkpoint=False)
def mock_extract_missions(number_of_months: int) -> pd.DataFrame:
    return missions_df


@task(checkpoint=False)
def mock_extract_missions_control_units() -> pd.DataFrame:
    return missions_control_units_df


flow.replace(flow.get_tasks("extract_missions")[0], mock_extract_missions)
flow.replace(
    flow.get_tasks("extract_missions_control_units")[0],
    mock_extract_missions_control_units,
)


@patch("src.pipeline.flows.missions.extract")
def test_extract_missions(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_missions.run(number_of_months=12)
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.missions.extract")
def test_extract_missions_control_units(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_missions_control_units.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


def test_flow(reset_test_data):
    missions_query = "SELECT * FROM analytics_missions ORDER BY id"
    missions_control_units_query = (
        "SELECT * FROM analytics_missions_control_units ORDER BY id"
    )

    initial_missions = read_query(missions_query, db="monitorfish_remote")
    initial_missions_control_units = read_query(
        missions_control_units_query, db="monitorfish_remote"
    )

    flow.schedule = None
    state = flow.run(number_of_months=12)
    assert state.is_successful()

    extracted_missions = state.result[flow.get_tasks("mock_extract_missions")[0]].result
    extracted_missions_control_units = state.result[
        flow.get_tasks("mock_extract_missions_control_units")[0]
    ].result

    filtered_missions_control_units = state.result[
        flow.get_tasks("filter_missions_control_units")[0]
    ].result

    loaded_missions = read_query(missions_query, db="monitorfish_remote")
    loaded_missions_control_units = read_query(
        missions_control_units_query, db="monitorfish_remote"
    )

    assert len(initial_missions) == 25
    assert len(initial_missions_control_units) == 27

    initial_mission_ids = set(range(1, 24)).union({-199999, -144762})
    extracted_mission_ids = {1, 2, 112, 113}
    extracted_missions_control_unit_ids = {1, 2, 112, 999}

    assert (
        set(initial_missions.id)
        == set(initial_missions_control_units.mission_id)
        == initial_mission_ids
    )

    assert len(extracted_missions) == 4
    assert set(extracted_missions.id) == extracted_mission_ids

    assert len(extracted_missions_control_units) == 5
    assert (
        set(extracted_missions_control_units.mission_id)
        == extracted_missions_control_unit_ids
    )

    assert len(filtered_missions_control_units) == 4
    assert set(
        filtered_missions_control_units.mission_id
    ) == extracted_missions_control_unit_ids.intersection(extracted_mission_ids)

    pd.testing.assert_frame_equal(extracted_missions, loaded_missions, check_like=True)
    pd.testing.assert_frame_equal(
        filtered_missions_control_units, loaded_missions_control_units
    )
