import unittest
from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.last_positions import (
    extract_current_segments,
    extract_last_controls,
    extract_last_positions,
    flow,
    load_last_positions,
)
from tests.mocks import mock_extract_side_effect


class TestLastPositionsFlow(unittest.TestCase):
    @patch("src.pipeline.flows.last_positions.extract")
    def test_extract_current_segments(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_current_segments.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.last_positions.extract")
    def test_extract_last_positions(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_last_positions.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.last_positions.extract")
    def test_extract_last_controls(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_last_controls.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.last_positions.load", autospec=True)
    def test_load_last_positions(self, mock_load):
        dummy_last_positions = pd.DataFrame()
        load_last_positions.run(dummy_last_positions)
