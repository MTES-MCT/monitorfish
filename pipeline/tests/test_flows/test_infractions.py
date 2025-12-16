from unittest.mock import patch

import pandas as pd
import pytest
import sqlalchemy

from src.flows.infractions import (
    clean_infractions,
    extract_infractions,
    load_infractions,
)
from src.read_query import read_query
from tests.mocks import mock_extract_side_effect


@patch("src.flows.infractions.extract")
def test_extract_infractions(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_infractions()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


@pytest.fixture
def infractions() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "natinf_code": [20978, 22206, 22564, 27724, 30771, 30788, 40409],
            "regulation": [None, "Reg pêche 1", None, "Reg pêche 5", None, None, "d89-273"],
            "infraction_category": [
                "Environnement",
                "Pêche",
                "Environnement",
                "Pêche",
                "Environnement",
                "Environnement",
                "Pêche",
            ],
            "infraction": [
                "DETENTION D'ESPECE ANIMALE NON DOMESTIQUE - ESPECE PROTEGEE",
                "INFRACTION 1",
                "USAGE DE FOYER LUMINEUX POUR LA PECHE SOUS-MARINE DE LOISIR",
                "INFRACTION 2",
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
            "natinf_code": [20978, 22206, 22564, 27724, 30771, 30788, 40409],
            "regulation": [None, "Reg pêche 1", None, "Reg pêche 5", None, None, "d89-273"],
            "infraction_category": [
                "Environnement",
                "Pêche",
                "Environnement",
                "Pêche",
                "Environnement",
                "Environnement",
                "Pêche",
            ],
            "infraction": [
                "Detention d'espece animale non domestique - espece protegee",
                "Infraction 1",
                "Usage de foyer lumineux pour la peche sous-marine de loisir",
                "Infraction 2",
                "Usage illegal scooter sous-marin",
                "Exercice de la peche sous-marine de loisir interdite",
                "Declaration erronee",
            ],
        }
    )


def test_clean_infractions(infractions, cleaned_infractions):
    res = clean_infractions(infractions)
    pd.testing.assert_frame_equal(res, cleaned_infractions)


def test_load_infractions(reset_test_data, cleaned_infractions):
    load_infractions(cleaned_infractions)
    loaded_infractions = read_query(
        "SELECT * FROM infractions ORDER BY natinf_code", db="monitorfish_remote"
    )

    pd.testing.assert_frame_equal(loaded_infractions, cleaned_infractions)
