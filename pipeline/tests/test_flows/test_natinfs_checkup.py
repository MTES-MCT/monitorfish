import datetime
from email.message import EmailMessage
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest
from prefect import task

from src.flows.natinfs_checkup import (
    extract_infraction_threat_characterization,
    extract_official_natinfs,
    get_expired_natinfs,
    natinfs_checkup_flow,
)
from tests.mocks import get_utcnow_mock_factory

LATEST_RESOURCE_URL = "https://static.data.gouv.fr/liste-natinf-octobre2026.csv"


def make_official_natinfs_csv(natinf_codes: list) -> bytes:
    rows = [
        f"{code};Délit;QUALIFICATION {code};ART. {code};ART. {code}"
        for code in natinf_codes
    ]
    return "\n".join(
        [
            "Numéro NATINF;Nature de l'infraction;Qualification de l'infraction;"
            "Définie par;Réprimée par",
            *rows,
        ]
    ).encode("cp1252")


def mock_requests_get_factory(natinf_codes: list):
    def mock_requests_get(url, **kwargs):
        response = MagicMock()
        if url.endswith("/datasets/dataset_id/"):
            response.json.return_value = {
                "resources": [
                    {
                        "title": "Liste Natinf_juillet2026.csv",
                        "last_modified": "2026-09-06T14:32:26.891000+00:00",
                        "url": "https://static.data.gouv.fr/liste-natinf-juillet2026.csv",
                    },
                    {
                        "title": "Liste Natinf_octobre2026.csv",
                        "last_modified": "2026-10-20T16:18:28.443000+00:00",
                        "url": LATEST_RESOURCE_URL,
                    },
                ]
            }
        elif url == LATEST_RESOURCE_URL:
            response.content = make_official_natinfs_csv(natinf_codes)
        else:
            raise ValueError(f"Unexpected url {url}")
        return response

    return mock_requests_get


IN_FORCE_NATINFS = [22206, *range(30000, 31000)]


@task
def mock_send_message(msg: EmailMessage):
    assert isinstance(msg, EmailMessage)


@pytest.fixture
def infraction_threat_characterization() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "natinf_code": [22206, 27724],
            "infraction": ["Infraction 1", "Infraction 2"],
            "threat": ["Test Threat 1", "Test Threat 2"],
            "threat_characterization": [
                "Test Characterization 1",
                "Test Characterization 2",
            ],
            "isr_code": [None, None],
        }
    )


@patch("src.flows.natinfs_checkup.requests.get")
def test_extract_official_natinfs_reads_the_latest_resource(mock_get):
    mock_get.side_effect = mock_requests_get_factory(IN_FORCE_NATINFS)

    official_natinfs, source = extract_official_natinfs("dataset_id", proxies=None)

    assert source == "Liste Natinf_octobre2026.csv"
    assert list(official_natinfs.columns) == ["natinf_code", "official_infraction"]
    assert len(official_natinfs) == 1001
    assert official_natinfs.iloc[0].to_dict() == {
        "natinf_code": 22206,
        "official_infraction": "QUALIFICATION 22206",
    }


@patch("src.flows.natinfs_checkup.requests.get")
def test_extract_official_natinfs_raises_on_truncated_file(mock_get):
    mock_get.side_effect = mock_requests_get_factory([22206])

    with pytest.raises(ValueError, match="Only 1 NATINFs found"):
        extract_official_natinfs("dataset_id", proxies=None)


def test_extract_infraction_threat_characterization(
    reset_test_data, infraction_threat_characterization
):
    res = extract_infraction_threat_characterization()
    pd.testing.assert_frame_equal(
        res, infraction_threat_characterization, check_dtype=False
    )


def test_get_expired_natinfs(infraction_threat_characterization):
    official_natinfs = pd.DataFrame(
        {"natinf_code": [22206], "official_infraction": ["QUALIFICATION 22206"]}
    )

    res = get_expired_natinfs(infraction_threat_characterization, official_natinfs)

    expected_res = pd.DataFrame(
        {
            "NATINF": [27724],
            "Libellé": ["Infraction 2"],
            "Menace": ["Test Threat 2"],
            "Caractérisation de la menace": ["Test Characterization 2"],
            "Code ISR": [None],
        }
    )
    pd.testing.assert_frame_equal(res, expected_res)


@patch("src.flows.natinfs_checkup.send_message", mock_send_message)
@patch(
    "src.flows.natinfs_checkup.get_utcnow",
    get_utcnow_mock_factory(datetime.datetime(2026, 10, 26, 6, 10)),
)
@patch("src.flows.natinfs_checkup.requests.get")
def test_flow_sends_expired_natinfs(mock_get, reset_test_data):
    mock_get.side_effect = mock_requests_get_factory(IN_FORCE_NATINFS)

    state = natinfs_checkup_flow(natinfs_dataset_id="dataset_id", return_state=True)
    assert state.is_completed()

    email = state.result()
    assert isinstance(email, EmailMessage)
    assert email["subject"] == "[Monitorfish] NATINF qui ne sont plus en vigueur"
    assert (
        email["To"]
        == "cnsp.france@test.email, natinfs.1@test.email, natinfs.2@test.email"
    )

    html = email.get_content()
    assert "Vérification du 26/10/2026" in html
    assert "Les 1 NATINF suivantes" in html
    assert "Liste Natinf_octobre2026.csv" in html
    assert "<td>27724</td>" in html
    assert "<td>22206</td>" not in html


@patch("src.flows.natinfs_checkup.send_message")
@patch("src.flows.natinfs_checkup.requests.get")
def test_flow_does_not_send_email_when_all_natinfs_are_in_force(
    mock_get, mock_send, reset_test_data
):
    mock_get.side_effect = mock_requests_get_factory([27724, *IN_FORCE_NATINFS])

    state = natinfs_checkup_flow(natinfs_dataset_id="dataset_id", return_state=True)

    assert state.is_completed()
    assert state.result() is None
    mock_send.assert_not_called()
