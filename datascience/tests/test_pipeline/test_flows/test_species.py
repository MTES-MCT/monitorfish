import unittest
from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.species import extract_species, flow, load_species
from tests.mocks import mock_extract_side_effect


class TestSpeciesFlow(unittest.TestCase):
    @patch("src.pipeline.flows.species.load", autospec=True)
    def test_load_species(self, mock_load):
        dummy_species = pd.DataFrame()
        load_species.run(dummy_species)
