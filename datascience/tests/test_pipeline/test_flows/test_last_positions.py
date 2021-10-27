import unittest
from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.last_positions import (
    extract_last_positions,
    extract_risk_factors,
    flow,
    load_last_positions,
)
from tests.mocks import mock_extract_side_effect


class TestLastPositionsFlow(unittest.TestCase):
    @patch("src.pipeline.flows.last_positions.extract")
    def test_extract_risk_factors(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_risk_factors.run()
        self.assertTrue(isinstance(query, sqlalchemy.sql.elements.TextClause))

    @patch("src.pipeline.flows.last_positions.extract")
    def test_extract_last_positions(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_last_positions.run(minutes=10)
        self.assertTrue(isinstance(query, sqlalchemy.sql.elements.TextClause))

    @patch("src.pipeline.flows.last_positions.load", autospec=True)
    def test_load_last_positions(self, mock_load):
        dummy_last_positions = pd.DataFrame()
        load_last_positions.run(dummy_last_positions)
