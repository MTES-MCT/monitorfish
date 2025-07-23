from unittest.mock import patch

import pandas as pd
import pytest
import sqlalchemy
from prefect import task

from config import CNSP_SIP_DEPARTMENT_EMAIL
from src.flows.foreign_fmcs import (
    extract_foreign_fmcs_contacts,
    foreign_fmcs_flow,
    transform_foreign_fmcs_contacts,
)
from src.read_query import read_query
from tests.mocks import mock_extract_side_effect

foreign_fmcs_contacts_df = pd.DataFrame(
    {
        "country_code_iso3": ["AAA", "AAA", "BBB", "CCC", "AAA", "DDD"],
        "country_name": [
            "Alabama",
            "Alabama",
            "Boulgiboulgastan",
            "Coulemelistan",
            "Alabama",
            "Dalailastan",
        ],
        "email_address": [
            "fmc@aaa.com",
            CNSP_SIP_DEPARTMENT_EMAIL,
            "fmc@bbb.io",
            None,
            "fmc2@aaa.com",
            CNSP_SIP_DEPARTMENT_EMAIL,
        ],
    }
)

transformed_foreign_fmcs_df = pd.DataFrame(
    {
        "country_code_iso3": ["AAA", "BBB", "CCC", "DDD"],
        "country_name": ["Alabama", "Boulgiboulgastan", "Coulemelistan", "Dalailastan"],
        "email_addresses": [
            ["fmc@aaa.com", "fmc2@aaa.com"],
            ["fmc@bbb.io"],
            float("nan"),
            float("nan"),
        ],
    }
)


loaded_foreign_fmcs_df = pd.DataFrame(
    {
        "country_code_iso3": ["AAA", "BBB", "CCC", "DDD"],
        "country_name": ["Alabama", "Boulgiboulgastan", "Coulemelistan", "Dalailastan"],
        "email_addresses": [["fmc@aaa.com", "fmc2@aaa.com"], ["fmc@bbb.io"], [], []],
    }
)


@pytest.fixture
def foreign_fmcs_contacts() -> pd.DataFrame:
    return foreign_fmcs_contacts_df


@pytest.fixture
def transformed_foreign_fmcs() -> pd.DataFrame:
    return transformed_foreign_fmcs_df


@pytest.fixture
def loaded_foreign_fmcs() -> pd.DataFrame:
    return loaded_foreign_fmcs_df


@task
def mock_extract_foreign_fmcs_contacts() -> pd.DataFrame:
    return foreign_fmcs_contacts_df


@patch("src.flows.foreign_fmcs.extract")
def test_extract_foreign_fmcs_contacts_file_is_found(mock_extract):
    mock_extract.side_effect = mock_extract_side_effect
    query = extract_foreign_fmcs_contacts()
    assert isinstance(query, sqlalchemy.sql.elements.TextClause)


def test_transform_foreign_fmcs_contacts(
    foreign_fmcs_contacts, transformed_foreign_fmcs
):
    res = transform_foreign_fmcs_contacts(foreign_fmcs_contacts)
    pd.testing.assert_frame_equal(res, transformed_foreign_fmcs)


def test_foreign_fmcs_flow(reset_test_data, loaded_foreign_fmcs):
    state = foreign_fmcs_flow(
        extract_foreign_fmcs_contacts_task=mock_extract_foreign_fmcs_contacts,
        return_state=True,
    )

    assert state.is_completed()

    res = read_query(
        "SELECT * FROM foreign_fmcs ORDER BY country_code_iso3", db="monitorfish_remote"
    )
    pd.testing.assert_frame_equal(res, loaded_foreign_fmcs)
