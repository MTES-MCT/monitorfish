import unittest
from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.vessels import (
    extract_cee_vessels,
    extract_floats,
    extract_fr_vessels,
    extract_nav_licences,
    extract_non_cee_vessels,
    flow,
)
from tests.mocks import mock_extract_side_effect


class TestVesselsFlow(unittest.TestCase):
    @patch("src.pipeline.flows.vessels.extract")
    def test_extract_cee_vessels(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_cee_vessels.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.vessels.extract")
    def test_extract_floats(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_floats.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.vessels.extract")
    def test_extract_fr_vessels(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_fr_vessels.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.vessels.extract")
    def test_extract_nav_licences(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_nav_licences.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.vessels.extract")
    def test_extract_non_cee_vessels(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_non_cee_vessels.run()
        self.assertTrue(isinstance(query, str))
