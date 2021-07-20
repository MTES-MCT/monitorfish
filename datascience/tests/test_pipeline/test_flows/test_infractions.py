import unittest
from unittest.mock import patch

import pandas as pd
import sqlalchemy

from src.pipeline.flows.infractions import (
    clean_infractions,
    extract_infractions,
    flow,
    load_infractions,
)
from tests.mocks import mock_extract_side_effect


class TestInfractionsFlow(unittest.TestCase):
    @patch("src.pipeline.flows.infractions.extract")
    def test_extract_infractions(self, mock_extract):
        mock_extract.side_effect = mock_extract_side_effect
        query = extract_infractions.run()
        self.assertTrue(isinstance(query, sqlalchemy.sql.elements.TextClause))

    def test_clean_infractions(self):
        infractions = pd.DataFrame(
            {
                "infraction": [
                    "INFRACTION_1",
                    "Infraction numéro 2",
                    "T.y.p.e d'infraction",
                ]
            }
        )

        cleaned_infractions = clean_infractions.run(infractions)

        self.assertEqual(
            cleaned_infractions.values.tolist(),
            [["Infraction_1"], ["Infraction numéro 2"], ["T.y.p.e d'infraction"]],
        )

    @patch("src.pipeline.flows.infractions.load", autospec=True)
    def test_load_infractions(self, mock_load):
        dummy_infractions = pd.DataFrame()
        load_infractions.run(dummy_infractions)
