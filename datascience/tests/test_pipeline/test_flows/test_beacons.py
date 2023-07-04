from datetime import datetime
from unittest.mock import patch

import pandas as pd
import pytest
import sqlalchemy

from src.pipeline.flows.beacons import (
    extract_beacons,
    extract_satellite_operators,
    load_beacons,
    load_satellite_operators,
    transform_beacons,
    transform_satellite_operators,
)
from src.read_query import read_query
from tests.mocks import mock_extract_side_effect


@patch("src.pipeline.flows.beacons.extract")
def test_extract_beacons(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_beacons.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@patch("src.pipeline.flows.beacons.extract")
def test_extract_satellite_operators(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_satellite_operators.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@pytest.fixture
def logging_datetime_utc() -> datetime:
    return datetime(2021, 5, 2, 12, 25, 23)


@pytest.fixture
def beacons(logging_datetime_utc) -> pd.DataFrame:
    d = logging_datetime_utc
    return pd.DataFrame(
        {
            "beacon_number": ["A", "B", "C", "D", "E", "F", "G"],
            "vessel_id": [1, 2, 3, 4, 5, 6, None],
            "beacon_status": [
                "Activée",
                "Désactivée",
                "En test",
                "Non agréée",
                "Non surveillée",
                None,
                None,
            ],
            "satellite_operator_id": [1, 1, 2, 2, 3, None, None],
            "logging_datetime_utc": [d, d, d, d, d, d, d],
            "beacon_type": ["A1", "B", "A2", None, "A1", "B", "A2"],
            "is_coastal": [0, 1, 0, None, 0, 1, 0],
        }
    )


@pytest.fixture
def transformed_beacons(logging_datetime_utc) -> pd.DataFrame:
    d = logging_datetime_utc
    return pd.DataFrame(
        {
            "beacon_number": ["A", "B", "C", "D", "E", "F", "G"],
            "vessel_id": [1, 2, 3, 4, 5, 6, None],
            "beacon_status": [
                "ACTIVATED",
                "DEACTIVATED",
                "IN_TEST",
                "NON_APPROVED",
                "UNSUPERVISED",
                None,
                None,
            ],
            "satellite_operator_id": [1, 1, 2, 2, 3, None, None],
            "logging_datetime_utc": [d, d, d, d, d, d, d],
            "beacon_type": ["A1", "B", "A2", None, "A1", "B", "A2"],
            "is_coastal": [False, True, False, None, False, True, False],
        }
    )


@pytest.fixture
def satellite_operators() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [1, 2, 3],
            "name": ["SAT", "SAT2", "SAT3"],
            "emails": ["simple@email.com", "contact1@sat2.com, conact2@sat2.com", None],
        }
    )


@pytest.fixture
def tranformed_satellite_operators() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [1, 2, 3],
            "name": ["SAT", "SAT2", "SAT3"],
            "emails": [
                ["simple@email.com"],
                ["contact1@sat2.com", "conact2@sat2.com"],
                None,
            ],
        }
    )


def test_transform_beacons(beacons, transformed_beacons):
    res = transform_beacons.run(beacons)
    pd.testing.assert_frame_equal(res, transformed_beacons)


def test_transform_satellite_operators(
    satellite_operators, tranformed_satellite_operators
):
    res = transform_satellite_operators.run(satellite_operators)
    pd.testing.assert_frame_equal(res, tranformed_satellite_operators)


def test_load_beacons(reset_test_data, transformed_beacons):

    load_beacons.run(transformed_beacons)

    loaded_beacons = read_query(
        "SELECT * FROM beacons ORDER BY beacon_number", db="monitorfish_remote"
    )

    pd.testing.assert_frame_equal(loaded_beacons, transformed_beacons)


def test_load_satellite_operators(reset_test_data, tranformed_satellite_operators):
    load_satellite_operators.run(tranformed_satellite_operators)
