from unittest.mock import patch

import pandas as pd

from src.shared_tasks.positions import (
    add_depth,
    add_vessel_identifier,
    tag_positions_at_port,
)
from tests.mocks import mock_get_depth


@patch("src.shared_tasks.positions.extract")
def test_tag_positions_at_port(mock_extract):
    mock_extract.return_value = pd.DataFrame(
        {
            "h3": [
                "8900510a463ffff",
                "892b2c359d3ffff",
                "some_other_h3_cell",
            ],
        }
    )

    positions = pd.DataFrame(
        {
            "latitude": [45, 85.1, -85.2, 45.3, 45.4],
            "longitude": [89.1, 10, -10, 12.6, -59.16],
        }
    )

    positions_with_is_at_port = tag_positions_at_port(positions)

    expected_positions_with_is_at_port = positions.copy().assign(
        is_at_port=[False, True, False, False, True]
    )

    pd.testing.assert_frame_equal(
        positions_with_is_at_port, expected_positions_with_is_at_port
    )


@patch("src.shared_tasks.positions.extract")
def test_tag_positions_at_port_empty_dataframe(mock_extract):
    positions = pd.DataFrame(
        {
            "latitude": [],
            "longitude": [],
        }
    ).astype({"latitude": float, "longitude": float})

    positions_with_is_at_port = tag_positions_at_port(positions)

    # Query should not be run with empty list in WHERE condition
    mock_extract.assert_not_called()

    expected_positions_with_is_at_port = pd.DataFrame(
        columns=pd.Index(["latitude", "longitude", "is_at_port"])
    ).astype({"latitude": float, "longitude": float, "is_at_port": bool})

    pd.testing.assert_frame_equal(
        positions_with_is_at_port,
        expected_positions_with_is_at_port,
        check_index_type=False,
    )


@patch("src.shared_tasks.positions.extract")
def test_tag_positions_at_port_with_in_on_land(mock_extract):
    mock_extract.return_value = pd.DataFrame(
        {
            "h3": [
                "8900510a463ffff",
                "892b2c359d3ffff",
                "some_other_h3_cell",
            ],
        }
    )

    positions = pd.DataFrame(
        {
            "latitude": [45, 85.1, -85.2, 45.3, 45.4],
            "longitude": [89.1, 10, -10, 12.6, -59.16],
            "is_on_land": [False, False, True, False, True],
        }
    )

    positions_with_is_at_port = tag_positions_at_port(positions)

    expected_positions_with_is_at_port = (
        positions.copy()
        .assign(is_at_port=[False, True, True, False, True])
        .drop(columns=["is_on_land"])
    )

    pd.testing.assert_frame_equal(
        positions_with_is_at_port, expected_positions_with_is_at_port
    )


def test_add_vessel_identifier():
    last_positions = pd.DataFrame(
        {
            "cfr": ["A", "B", None, None, None],
            "ircs": ["aa", "bb", "cc", None, "ee"],
            "external_immatriculation": ["aaa", None, None, "ddd", "eee"],
            "some": [1, 2, None, 1, 1],
            "more": ["a", None, "c", "d", "e"],
            "data": [None, 2.256, 0.1, 2.36, None],
        }
    )

    last_positions_with_vessel_identifier = add_vessel_identifier(last_positions)

    expected_last_positions_with_vessel_identifier = last_positions.copy(
        deep=True
    ).assign(
        vessel_identifier=[
            "INTERNAL_REFERENCE_NUMBER",
            "INTERNAL_REFERENCE_NUMBER",
            "IRCS",
            "EXTERNAL_REFERENCE_NUMBER",
            "IRCS",
        ]
    )

    pd.testing.assert_frame_equal(
        last_positions_with_vessel_identifier,
        expected_last_positions_with_vessel_identifier,
    )


@patch("src.shared_tasks.positions.get_depth", mock_get_depth)
def test_add_depth():
    df = pd.DataFrame(
        {
            "latitude": [48.5, 47.2, 46.8, 45.1, 43.7],
            "longitude": [-4.5, -3.2, -1.8, 0.5, 2.1],
            "vessel_name": [
                "Bretagne",
                "Normandie",
                "Aquitaine",
                "Provence",
                "Corsica",
            ],
            "speed_knots": [12.5, 8.3, 15.7, 6.9, 11.2],
        }
    )

    expected_df_with_depth = df.assign(depth=df.longitude)
    df_with_depth = add_depth(df)
    pd.testing.assert_frame_equal(df_with_depth, expected_df_with_depth)

    df_with_depth_empty_input = add_depth.fn(df.head(0))
    pd.testing.assert_frame_equal(
        df_with_depth_empty_input, expected_df_with_depth.head(0)
    )
