from unittest.mock import patch

import pandas as pd

from src.pipeline.flows.species import load_species


@patch("src.pipeline.flows.species.load", autospec=True)
def test_load_species(mock_load):
    dummy_species = pd.DataFrame()
    load_species.run(dummy_species)
