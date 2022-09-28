from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.beacons import (
    extract_beacons,
    extract_satellite_operators,
    load_beacons,
    load_satellite_operators,
    transform_beacons,
    transform_satellite_operators,
)
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


def test_transform_beacons():
    beacons = pd.DataFrame(
        {
            "beacon_number": ["A", "B", "C", "D", "E", "F"],
            "vessel_id": [1, 2, 3, 4, 5, 6],
            "beacon_status": [
                "Activée",
                "Désactivée",
                "En test",
                "Non agréée",
                "Non surveillée",
                None,
            ],
            "satellite_operator_id": [1, 1, 2, 2, 3, None],
        }
    )

    transformed_beacons = transform_beacons.run(beacons)
    expected_transformed_beacons = pd.DataFrame(
        {
            "beacon_number": ["A", "B", "C", "D", "E", "F"],
            "vessel_id": [1, 2, 3, 4, 5, 6],
            "beacon_status": [
                "ACTIVATED",
                "DEACTIVATED",
                "IN_TEST",
                "NON_APPROVED",
                "UNSUPERVISED",
                None,
            ],
            "satellite_operator_id": [1, 1, 2, 2, 3, None],
        }
    )

    pd.testing.assert_frame_equal(transformed_beacons, expected_transformed_beacons)


def test_transform_satellite_operators():

    satellite_operators = pd.DataFrame(
        {
            "id": [1, 2, 3],
            "name": ["SAT", "SAT2", "SAT3"],
            "emails": ["simple@email.com", "contact1@sat2.com, conact2@sat2.com", None],
        }
    )

    res = transform_satellite_operators.run(satellite_operators)
    expected_res = pd.DataFrame(
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
    pd.testing.assert_frame_equal(res, expected_res)


def test_load_beacons(reset_test_data):

    beacons = pd.DataFrame(
        {
            "beacon_number": ["A", "B", "C", "D", "E", "F"],
            "vessel_id": [1, 2, 3, 4, 5, 6],
            "beacon_status": [
                "ACTIVATED",
                "DEACTIVATED",
                "IN_TEST",
                "NON_APPROVED",
                "UNSUPERVISED",
                None,
            ],
            "satellite_operator_id": [1, 1, 2, 2, 3, None],
        }
    )

    load_beacons.run(beacons)


def test_load_satellite_operators(reset_test_data):

    satellite_operators = pd.DataFrame(
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

    load_satellite_operators.run(satellite_operators)
