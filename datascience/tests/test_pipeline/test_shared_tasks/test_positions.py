import unittest
from datetime import datetime, timedelta
from unittest.mock import patch

import pandas as pd
import sqlalchemy

from config import default_risk_factors
from src.pipeline.shared_tasks.positions import tag_positions_at_port
from tests.mocks import mock_extract_side_effect


class TestLastPositionsFlow(unittest.TestCase):
    @patch("src.pipeline.shared_tasks.positions.extract")
    def test_tag_positions_at_port(self, mock_extract):

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

        positions_with_is_at_port = tag_positions_at_port.run(positions)

        expected_positions_with_is_at_port = positions.copy().assign(
            is_at_port=[False, True, False, False, True]
        )

        pd.testing.assert_frame_equal(
            positions_with_is_at_port, expected_positions_with_is_at_port
        )

    @patch("src.pipeline.shared_tasks.positions.extract")
    def test_tag_positions_at_port_empty_dataframe(self, mock_extract):

        positions = pd.DataFrame(
            {
                "latitude": [],
                "longitude": [],
            }
        ).astype({"latitude": float, "longitude": float})

        positions_with_is_at_port = tag_positions_at_port.run(positions)

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
