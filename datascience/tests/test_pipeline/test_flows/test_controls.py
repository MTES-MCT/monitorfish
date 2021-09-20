import unittest
from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.controls import extract_controls, flow, load_controls
from tests.mocks import mock_extract_side_effect


class TestControlsFlow(unittest.TestCase):
    @patch("src.pipeline.flows.controls.extract")
    def test_extract_controls(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_controls.run(number_of_months=12)
        self.assertTrue(isinstance(query, sqlalchemy.sql.elements.TextClause))

    @patch("src.pipeline.flows.controls.load", autospec=True)
    def test_load_controls(self, mock_load):
        dummy_controls = pd.DataFrame()
        load_controls.run(dummy_controls, how="upsert")
