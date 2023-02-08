from unittest.mock import patch

import pandas as pd
import pytest
import sqlalchemy
from prefect import task

from src.pipeline.flows.control_units import (
    extract_administrations,
    extract_control_units,
    flow,
)
from src.read_query import read_query
from tests.mocks import mock_check_flow_not_running, mock_extract_side_effect

flow.replace(flow.get_tasks("check_flow_not_running")[0], mock_check_flow_not_running)


administrations_df = pd.DataFrame(
    {
        "id": [1, 2, 3, 4],
        "name": ["Sheriffs", "Cowboys", "Walker Texas Rangers", "NYPD"],
    }
)

control_units_df = pd.DataFrame(
    {
        "id": [1, 2, 3, 4, 5, 6, 7, 8, 9],
        "administration_id": [1, 1, 1, 2, 2, 2, 3, 3, 4],
        "name": [
            "Jacky Jellyfish",
            "No Shit Sherlock",
            "Nozy Mary",
            "Michael Junior",
            "Mike The Buster",
            "Bernie Fast Feet",
            "Fisherman's Friend",
            "Bobby McDewis",
            "Chuck Norris",
        ],
        "archived": [False, False, False, False, False, True, False, False, False],
    }
)


@pytest.fixture
def administrations() -> pd.DataFrame:
    return administrations_df


@pytest.fixture
def control_units() -> pd.DataFrame:
    return control_units_df


@task(checkpoint=False)
def mock_extract_administrations():
    return administrations_df


@task(checkpoint=False)
def mock_extract_control_units():
    return control_units_df


flow.replace(flow.get_tasks("extract_administrations")[0], mock_extract_administrations)
flow.replace(flow.get_tasks("extract_control_units")[0], mock_extract_control_units)


@patch("src.pipeline.flows.control_units.extract")
def test_extract_control_units(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_control_units.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.control_units.extract")
def test_extract_administrations(mock_load):
    extract_administrations.run()


def test_flow(reset_test_data, administrations, control_units):

    administrations_query = "SELECT * FROM analytics_administrations ORDER BY id"
    control_units_query = "SELECT * FROM analytics_control_units ORDER BY id"

    initial_administrations = read_query("monitorfish_remote", administrations_query)
    initial_control_units = read_query("monitorfish_remote", control_units_query)

    flow.schedule = None
    state = flow.run()
    assert state.is_successful()

    final_administrations = read_query("monitorfish_remote", administrations_query)
    final_control_units = read_query("monitorfish_remote", control_units_query)

    assert len(final_administrations) == len(initial_administrations) + 1 == 4
    assert len(final_control_units) == len(initial_control_units) + 1 == 9

    pd.testing.assert_frame_equal(final_control_units, control_units)
    pd.testing.assert_frame_equal(final_administrations, administrations)
