from io import BytesIO
from unittest.mock import patch

import pandas as pd
import pytest
from prefect import task

from src.flows.ports import invalidate_cache, ports_flow
from src.read_query import read_query
from tests.mocks import mock_update_resource

local_ports_data = pd.DataFrame(
    {
        "country_code_iso2": ["AU", "BR", "FR", "FR", "FR", "UZ"],
        "locode": ["AUNMP", "BRUBA", "FRBI3", "FRNOI", "FRS22", "UZAZN"],
        "port_name": [
            "New Moon",
            "Ubá",
            "Billiers",
            "Noirmoutier-En-L'Île",
            "Sausset-Les-Pins",
            "Andizhan",
        ],
        "latitude": [None, None, 47.52964, 47.001143, 43.332412, None],
        "longitude": [None, None, -2.48806, -2.247107, 5.11057, None],
        "geometry": [
            None,
            None,
            "0101000020E6100000D6E253008CE703C0A453573ECBC34740",
            "0101000020E6100000C1E61C3C13FA01C046CF2D7425804740",
            "0101000020E6100000C5AC1743397114402366F6798CAA4540",
            None,
        ],
        "is_active": [False, False, True, True, True, False],
    }
)


@pytest.fixture
def expected_loaded_ports() -> pd.DataFrame:
    df = local_ports_data.copy(deep=True)
    df = df.drop(columns=["geometry"])
    df["region"] = [None, None, "56", "56", None, None]
    df["fao_areas"] = [[], [], ["27.8"], ["27.8"], [], []]
    df["facade"] = [None, None, "SA", "SA", "NAMO", None]
    return df


@pytest.fixture
def expected_ports_open_data(expected_loaded_ports) -> pd.DataFrame:
    df = expected_loaded_ports.copy(deep=True)
    df["fao_areas"] = ["{}", "{}", "{27.8}", "{27.8}", "{}", "{}"]
    return df


@task
def mock_extract_local_ports() -> pd.DataFrame:
    return local_ports_data


mock_calls = []


@task
def mock_invalidate_cache() -> pd.DataFrame:
    with patch("src.flows.ports.requests") as mock_requests:
        invalidate_cache.fn()

    mock_calls.append(mock_requests)


def test_flow(reset_test_data, expected_ports_open_data, expected_loaded_ports):
    state = ports_flow(
        extract_local_ports_fn=mock_extract_local_ports,
        update_resource_fn=mock_update_resource,
        invalidate_cache_fn=mock_invalidate_cache,
        return_state=True,
    )
    assert state.is_completed()

    # Check loaded ports
    query = "SELECT * FROM ports ORDER BY locode"
    loaded_ports = read_query(query, db="monitorfish_remote")
    pd.testing.assert_frame_equal(loaded_ports, expected_loaded_ports, check_like=True)

    # Check cache invalidation
    mock_call = mock_calls.pop()
    mock_call.put.assert_called_once_with(
        "https://monitor.fish/api/v1/ports/invalidate"
    )

    # Check open data publication
    csv_file_object = state.result()
    assert isinstance(csv_file_object, BytesIO)
    df_from_csv_file_object = (
        pd.read_csv(csv_file_object, dtype={"region": str})
        .sort_values("locode")
        .reset_index(drop=True)
    )

    pd.testing.assert_frame_equal(
        df_from_csv_file_object.convert_dtypes(),
        expected_ports_open_data.convert_dtypes(),
        check_like=True,
    )
