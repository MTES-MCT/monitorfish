import pandas as pd
import pytest
from prefect import task

from src.flows.species import flow
from src.read_query import read_query


@task(checkpoint=False)
def mock_extract_species() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "species_code": ["BFT", "SOL", "BSS", "HKE"],
            "french_name": ["Thon rouge", "Sole commune", None, "Merlu européen"],
            "scientific_name": [
                "Thunnus thynnus",
                "Solea solea",
                "Dicentrarchus labrax",
                "Merluccius merluccius",
            ],
        }
    )


flow.replace(flow.get_tasks("extract_species")[0], mock_extract_species)


@pytest.fixture
def expected_loaded_species() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "id": [0, 1, 2, 3, 4, 5, 6],
            "species_code": ["BFT", "SOL", "BSS", "HKE", "BF1", "BF2", "BF3"],
            "species_name": [
                "Thon rouge",
                "Sole commune",
                "Dicentrarchus labrax",
                "Merlu européen",
                "Thon rouge de l'Atlantique (Calibre 1)",
                "Thon rouge de l'Atlantique (Calibre 2)",
                "Thon rouge de l'Atlantique (Calibre 3)",
            ],
            "scip_species_type": [
                "TUNA",
                "DEMERSAL",
                None,
                "DEMERSAL",
                "TUNA",
                "TUNA",
                "TUNA",
            ],
        }
    )


def test_flow(reset_test_data, expected_loaded_species):
    query = "SELECT * FROM species ORDER BY id"

    initial_species = read_query(query, db="monitorfish_remote")
    state = flow.run()

    assert state.is_successful()
    final_species = read_query(query, db="monitorfish_remote")

    with pytest.raises(AssertionError):
        pd.testing.assert_frame_equal(initial_species, final_species)

    pd.testing.assert_frame_equal(final_species, expected_loaded_species)
