from unittest.mock import patch

import pandas as pd
import pytest
import sqlalchemy

from src.pipeline.flows.infractions import (
    clean_infractions,
    extract_infractions,
    load_infractions,
)
from src.read_query import read_query
from tests.mocks import mock_extract_side_effect


@patch("src.pipeline.flows.infractions.extract")
def test_extract_infractions(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_infractions.run()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@pytest.fixture
def infractions() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "natinf_code": [20978, 22564, 30771, 30788, 40409],
            "regulation": [None, None, None, None, "d89-273"],
            "infraction_category": [
                "Environnement",
                "Environnement",
                "Environnement",
                "Environnement",
                "Pêche",
            ],
            "infraction": [
                "DETENTION D'ESPECE ANIMALE NON DOMESTIQUE - ESPECE PROTEGEE",
                "USAGE DE FOYER LUMINEUX POUR LA PECHE SOUS-MARINE DE LOISIR",
                "USAGE ILLEGAL SCOOTER SOUS-MARIN",
                "EXERCICE DE LA PECHE SOUS-MARINE DE LOISIR INTERDITE",
                "DECLARATION ERRONEE",
            ],
        }
    )


@pytest.fixture
def cleaned_infractions() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "natinf_code": [20978, 22564, 30771, 30788, 40409],
            "regulation": [None, None, None, None, "d89-273"],
            "infraction_category": [
                "Environnement",
                "Environnement",
                "Environnement",
                "Environnement",
                "Pêche",
            ],
            "infraction": [
                "Detention d'espece animale non domestique - espece protegee",
                "Usage de foyer lumineux pour la peche sous-marine de loisir",
                "Usage illegal scooter sous-marin",
                "Exercice de la peche sous-marine de loisir interdite",
                "Declaration erronee",
            ],
        }
    )


def test_clean_infractions(infractions, cleaned_infractions):
    res = clean_infractions.run(infractions)
    pd.testing.assert_frame_equal(res, cleaned_infractions)


def test_load_infractions(reset_test_data, cleaned_infractions):
    load_infractions.run(cleaned_infractions)
    loaded_infractions = read_query(
        "monitorfish_remote", "SELECT * FROM infractions ORDER BY natinf_code"
    )

    pd.testing.assert_frame_equal(loaded_infractions, cleaned_infractions)
