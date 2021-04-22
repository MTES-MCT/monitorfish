import unittest
from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.fishing_gear_codes import (
    extract_fishing_gear_codes,
    flow,
    load_fishing_gear_codes,
)
from tests.mocks import mock_extract_side_effect


class TestFishingGearCodesFlow(unittest.TestCase):
    @patch("src.pipeline.flows.fishing_gear_codes.extract")
    def test_extract_fishing_gear_codes(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_fishing_gear_codes.run()
        self.assertTrue(isinstance(query, str))

    @patch("src.pipeline.flows.fishing_gear_codes.load", autospec=True)
    def test_load_fishing_gear_codes(self, mock_load):
        dummy_fishing_gear_codes = pd.DataFrame()
        load_fishing_gear_codes.run(dummy_fishing_gear_codes)
