import datetime
from email.message import EmailMessage
from unittest.mock import patch

import jinja2
import pandas as pd
import pytest
import requests
from prefect import task

from config import PROXIES, TEST_DATA_LOCATION
from src.flows.regulations_checkup import (
    add_article_id,
    extract_legipeche_regulations,
    extract_monitorfish_regulations,
    format_dead_links,
    format_outdated_references,
    get_body_template,
    get_dead_links,
    get_extraction_datetimes,
    get_main_template,
    get_missing_references,
    get_modified_regulations,
    get_outdated_references,
    get_recipients,
    get_style,
    get_unknown_links,
    make_html_hyperlinks,
    regulations_checkup_flow,
    transform_modified_regulations,
)
from tests.mocks import get_utcnow_mock_factory


@task
def mock_get_dead_links(
    monitorfish_regulations: pd.DataFrame, unknown_links: set, proxies: dict
) -> pd.DataFrame:
    def return_404(url, **kwargs):
        r = requests.Response()
        r.status_code = 404
        r.url = url
        return r

    with patch("src.flows.regulations_checkup.requests.get", return_404):
        return get_dead_links(monitorfish_regulations, unknown_links, proxies)


@task
def mock_send_message(msg: EmailMessage):
    assert isinstance(msg, EmailMessage)


@pytest.fixture
def monitorfish_regulations() -> pd.DataFrame:
    regulations = pd.DataFrame(
        {
            "law_type": [
                "Reg. Facade 1",
                "Reg. Facade 1",
                "Reg. Facade 1",
                "Reg. Facade 2",
                "Reg. Facade 2",
                "Reg. Facade 2",
                "Reg. RTC",
            ],
            "topic": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Zone RTC DNK",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
                "Zone RTC",
            ],
            "url": [
                "http://external.site.regulation",
                (
                    "http://legipeche.metier.e2"
                    ".rie.gouv.fr/some-regulation-a666.html?var=12"
                ),
                (
                    "http://legipeche.metier.e2"
                    ".rie.gouv.fr/modified-regulation-a668.html"
                ),
                None,
                "http://legipeche.metier.e2.rie.gouv.fr/regulation-a689.html",
                (
                    "http://legipeche.metier.e2"
                    ".rie.gouv.fr/deleted-regulation-a671.html"
                ),
                None,
            ],
            "reference": [
                "External regulation",
                "some regulation",
                "some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
                None,
            ],
            "end_date": [
                datetime.datetime(2017, 7, 14, 2, 40, 0),
                None,
                datetime.datetime(9999, 12, 31),
                None,
                datetime.datetime(2030, 3, 17, 17, 46, 40),
                None,
                None,
            ],
        }
    )
    return regulations


@pytest.fixture
def legipeche_regulations() -> pd.DataFrame:
    d1 = datetime.datetime(2021, 3, 2, 14, 25, 0)
    d2 = datetime.datetime(2021, 3, 3, 14, 25, 0)

    regulations = pd.DataFrame(
        {
            "extraction_datetime_utc": [d2, d2, d2, d2, d2, d2, d1, d1, d1, d1, d1, d1],
            "extraction_occurence": [
                "latest",
                "latest",
                "latest",
                "latest",
                "latest",
                "latest",
                "previous",
                "previous",
                "previous",
                "previous",
                "previous",
                "previous",
            ],
            "page_title": [
                "Bretagne modified reg",
                "Bretagne modified reg",
                "Unused regulation 2",
                "Bretagne regulation",
                "Unused regulation",
                "Med. sea regulation",
                "Some old page",
                "Bretagne modified reg",
                "Bretagne modified reg",
                "Bretagne regulation",
                "Unused regulation",
                "Med. sea regulation",
            ],
            "page_url": [
                "http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html",
                "http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html",
                "http://legipeche.metier.e2.rie.gouv.fr/other-unused-regulation-a675.html",
                "http://legipeche.metier.e2.rie.gouv.fr/some-regulation-a666.html",
                "http://legipeche.metier.e2.rie.gouv.fr/unused-regulation-a670.html",
                "https://legipeche.metier.e2.rie.gouv.fr/regulation-with-unstable-url-a689.html",
                "http://legipeche.metier.e2.rie.gouv.fr/deleted-regulation-a671.html",
                "http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html",
                "http://legipeche.metier.e2.rie.gouv.fr/modified-regulation-a668.html",
                "http://legipeche.metier.e2.rie.gouv.fr/some-regulation-a666.html",
                "http://legipeche.metier.e2.rie.gouv.fr/unused-regulation-a670.html",
                "https://legipeche.metier.e2.rie.gouv.fr/regulation-with-unstable-url-a689.html",
            ],
            "document_title": [
                "Bretagne modified reg 1",
                "Bretagne modified reg 3",
                "Unused reg text",
                "Bretagne reg text",
                "Unused reg text",
                "Med reg text",
                "Some old reg text",
                "Bretagne modified reg 1",
                "Bretagne modified reg 2",
                "Bretagne reg text",
                "Unused reg text",
                "Med reg text",
            ],
            "document_url": [
                "http://bzh.other_1",
                "http://bzh.other_3",
                "http://unused2.reg",
                "http://bzh.reg",
                "http://unused.reg",
                "http://med.reg",
                "http://some.thing",
                "http://bzh.other_1",
                "http://bzh.other_2",
                "http://bzh.reg",
                "http://unused.reg",
                "http://med.reg",
            ],
        }
    )

    return regulations


@pytest.fixture
def monitorfish_regulations_with_id(
    monitorfish_regulations: pd.DataFrame,
) -> pd.DataFrame:
    regulations = monitorfish_regulations.assign(
        article_id=[None, "666", "668", None, "689", "671", None]
    )
    return regulations


@pytest.fixture
def legipeche_regulations_with_id(legipeche_regulations: pd.DataFrame) -> pd.DataFrame:
    regulations = legipeche_regulations.assign(
        article_id=[
            "668",
            "668",
            "675",
            "666",
            "670",
            "689",
            "671",
            "668",
            "668",
            "666",
            "670",
            "689",
        ]
    )
    return regulations


@pytest.fixture
def modified_regulations(legipeche_regulations_with_id: pd.DataFrame) -> pd.DataFrame:
    return legipeche_regulations_with_id.iloc[[1, 8]].reset_index(drop=True)


@pytest.fixture
def transformed_regulations() -> pd.DataFrame:
    regulations = pd.DataFrame(
        {
            "Type de réglementation": ["Reg. Facade 1", "Reg. Facade 1"],
            "Thématique": ["Morbihan - bivalves", "Morbihan - bivalves"],
            "Zone": ["Secteur 2", "Secteur 2"],
            "Référence réglementaire": [
                (
                    '<a href="http://legipeche.metier.e2'
                    '.rie.gouv.fr/modified-regulation-a668.html">some other regulation'
                    "</a>"
                ),
                (
                    '<a href="http://legipeche.metier.e2'
                    '.rie.gouv.fr/modified-regulation-a668.html">some other regulation'
                    "</a>"
                ),
            ],
            "Modification": ["Ajout de document", "Suppression de document"],
            "Document": [
                '<a href="http://bzh.other_3">Bretagne modified reg 3</a>',
                '<a href="http://bzh.other_2">Bretagne modified reg 2</a>',
            ],
        }
    )

    return regulations


@pytest.fixture
def missing_references() -> pd.DataFrame:
    references = pd.DataFrame(
        {
            "Type de réglementation": ["Reg. Facade 2", "Reg. RTC"],
            "Thématique": ["Mediterranée - filets", "Zone RTC DNK"],
            "Zone": ["Zone A", "Zone RTC"],
        }
    )
    return references


@pytest.fixture
def unknown_links() -> set:
    return {
        "http://external.site.regulation",
        "http://legipeche.metier.e2.rie.gouv.fr/deleted-regulation-a671.html",
    }


@pytest.fixture
def dead_links(
    monitorfish_regulations_with_id: pd.DataFrame, unknown_links: set
) -> pd.DataFrame:
    return monitorfish_regulations_with_id[
        monitorfish_regulations_with_id.url.isin(unknown_links)
    ].reset_index(drop=True)


@pytest.fixture
def formatted_dead_links():
    links = pd.DataFrame(
        {
            "Type de réglementation": ["Reg. Facade 1", "Reg. Facade 2"],
            "Thématique": ["Morbihan - bivalves", "Mediterranée - filets"],
            "Zone": ["Secteur 1", "Zone C"],
            "Référence réglementaire": [
                '<a href="http://external.site.regulation">External regulation</a>',
                (
                    '<a href="http://legipeche.metier.e2'
                    '.rie.gouv.fr/deleted-regulation-a671.html">'
                    "Dead link regulation</a>"
                ),
            ],
        }
    )
    return links


@pytest.fixture
def outdated_references(monitorfish_regulations_with_id: pd.DataFrame):
    return monitorfish_regulations_with_id.iloc[[0, 4]].reset_index(drop=True)


@pytest.fixture
def formatted_outdated_references():
    return pd.DataFrame(
        {
            "Type de réglementation": ["Reg. Facade 1", "Reg. Facade 2"],
            "Thématique": ["Morbihan - bivalves", "Mediterranée - filets"],
            "Zone": ["Secteur 1", "Zone B"],
            "Référence réglementaire": [
                '<a href="http://external.site.regulation">External regulation</a>',
                (
                    '<a href="http://legipeche.metier.e2.rie.gouv.fr/regulation-a689.html">'
                    "Med regulation</a>"
                ),
            ],
            "Date de fin de validité": [
                datetime.datetime(2017, 7, 14, 2, 40),
                datetime.datetime(2030, 3, 17, 17, 46, 40),
            ],
        }
    )


def test_make_html_hyperlinks():
    urls = ["abc.fr", "null.com", "blabla.fr"]
    link_texts = ["ABC", "Not so null"]

    links = make_html_hyperlinks(urls, link_texts)
    assert links == ['<a href="abc.fr">ABC</a>', '<a href="null.com">Not so null</a>']

    urls.pop()
    links = make_html_hyperlinks(urls, link_texts)
    assert links == ['<a href="abc.fr">ABC</a>', '<a href="null.com">Not so null</a>']

    urls.pop()
    links = make_html_hyperlinks(urls, link_texts)
    assert links == ['<a href="abc.fr">ABC</a>']


def test_extract_monitorfish_regulations(
    reset_test_data: None, monitorfish_regulations: pd.DataFrame
):
    regulations = extract_monitorfish_regulations()

    pd.testing.assert_frame_equal(
        monitorfish_regulations,
        regulations.sort_values(["law_type", "zone"]).reset_index(drop=True),
    )


def test_extract_legipeche_regulations(
    reset_test_data: None, legipeche_regulations: pd.DataFrame
):
    regulations = extract_legipeche_regulations()
    pd.testing.assert_frame_equal(regulations, legipeche_regulations)


def test_add_article_id(
    monitorfish_regulations: pd.DataFrame, monitorfish_regulations_with_id: pd.DataFrame
):
    regulations = add_article_id(monitorfish_regulations, url_column="url")
    pd.testing.assert_frame_equal(regulations, monitorfish_regulations_with_id)


def test_add_article_id_2(
    legipeche_regulations: pd.DataFrame, legipeche_regulations_with_id: pd.DataFrame
):
    regulations = add_article_id(legipeche_regulations, url_column="page_url")
    pd.testing.assert_frame_equal(regulations, legipeche_regulations_with_id)


def test_get_extraction_datetimes(legipeche_regulations_with_id: pd.DataFrame):
    d1_string, d2_string = get_extraction_datetimes(legipeche_regulations_with_id)
    assert d1_string == "02/03/2021 15:25"
    assert d2_string == "03/03/2021 15:25"


def test_get_modified_regulations(
    legipeche_regulations_with_id: pd.DataFrame,
    monitorfish_regulations_with_id: pd.DataFrame,
    modified_regulations: pd.DataFrame,
):
    regulations = get_modified_regulations(
        legipeche_regulations_with_id, monitorfish_regulations_with_id
    )

    pd.testing.assert_frame_equal(regulations, modified_regulations)


def test_transform_modified_regulations(
    monitorfish_regulations_with_id: pd.DataFrame,
    modified_regulations: pd.DataFrame,
    transformed_regulations: pd.DataFrame,
):
    regulations = transform_modified_regulations(
        modified_regulations, monitorfish_regulations_with_id
    )
    pd.testing.assert_frame_equal(regulations, transformed_regulations)


def test_get_missing_references(
    monitorfish_regulations_with_id: pd.DataFrame, missing_references: pd.DataFrame
):
    references = get_missing_references(monitorfish_regulations_with_id)

    pd.testing.assert_frame_equal(references, missing_references)


def test_get_unknown_links(
    monitorfish_regulations_with_id: pd.DataFrame,
    legipeche_regulations_with_id: pd.DataFrame,
    unknown_links: set,
):
    links = get_unknown_links(
        monitorfish_regulations_with_id, legipeche_regulations_with_id
    )
    assert links == unknown_links


@patch("src.flows.regulations_checkup.requests.get")
def test_get_dead_links_when_response_is_200(
    mock_get,
    monitorfish_regulations_with_id: pd.DataFrame,
    unknown_links: set,
    dead_links: pd.DataFrame,
):
    def return_200(url, **kwargs):
        r = requests.Response()
        r.status_code = 200
        r.url = url
        return r

    mock_get.side_effect = return_200

    links = get_dead_links(
        monitorfish_regulations_with_id, unknown_links, proxies=PROXIES
    )

    assert mock_get.call_count == 2
    for unknown_link in unknown_links:
        mock_get.assert_any_call(unknown_link, timeout=10)

    pd.testing.assert_frame_equal(links, dead_links.head(0))


@patch("src.flows.regulations_checkup.requests.get")
def test_get_dead_links_when_response_is_404(
    mock_get,
    monitorfish_regulations_with_id: pd.DataFrame,
    unknown_links: set,
    dead_links: pd.DataFrame,
):
    def return_404(url, **kwargs):
        r = requests.Response()
        r.status_code = 404
        r.url = url
        return r

    mock_get.side_effect = return_404

    links = get_dead_links(
        monitorfish_regulations_with_id, unknown_links, proxies=PROXIES
    )

    assert mock_get.call_count == 2
    for unknown_link in unknown_links:
        mock_get.assert_any_call(unknown_link, timeout=10)

    pd.testing.assert_frame_equal(links, dead_links)


@patch("src.flows.regulations_checkup.requests.get")
def test_get_dead_links_when_request_times_out(
    mock_get,
    monitorfish_regulations_with_id: pd.DataFrame,
    unknown_links: set,
    dead_links: pd.DataFrame,
):
    def raise_timeout_if_no_proxies(url, **kwargs):
        if "proxies" in kwargs:
            r = requests.Response()
            r.status_code = 404
            r.url = url
            return r
        else:
            raise requests.ConnectTimeout(f"Connection to {url} timed out.")

    mock_get.side_effect = raise_timeout_if_no_proxies

    links = get_dead_links(
        monitorfish_regulations_with_id, unknown_links, proxies=PROXIES
    )

    assert mock_get.call_count == 4
    for unknown_link in unknown_links:
        mock_get.assert_any_call(unknown_link, timeout=10)
        mock_get.assert_any_call(unknown_link, timeout=10, proxies=PROXIES)

    pd.testing.assert_frame_equal(links, dead_links)


def test_format_dead_links(dead_links, formatted_dead_links):
    formatted_links = format_dead_links(dead_links)
    pd.testing.assert_frame_equal(formatted_links, formatted_dead_links)


def test_get_outdated_references(monitorfish_regulations_with_id):
    now = datetime.datetime(2021, 2, 3, 12, 56)
    outdated_references = get_outdated_references(monitorfish_regulations_with_id, now)

    pd.testing.assert_frame_equal(
        outdated_references, monitorfish_regulations_with_id.iloc[[0]]
    )

    now = datetime.datetime(2031, 2, 3, 12, 56)
    outdated_references = get_outdated_references(monitorfish_regulations_with_id, now)

    pd.testing.assert_frame_equal(
        outdated_references,
        monitorfish_regulations_with_id.iloc[[0, 4]].reset_index(drop=True),
    )


def test_format_outdated_references(outdated_references, formatted_outdated_references):
    res = format_outdated_references(outdated_references)
    pd.testing.assert_frame_equal(res, formatted_outdated_references, check_dtype=False)


def test_get_main_template():
    main_template = get_main_template()
    assert isinstance(main_template, jinja2.Template)


def test_get_body_template():
    body_template = get_body_template()
    assert isinstance(body_template, jinja2.Template)


def test_get_style():
    style = get_style()
    assert isinstance(style, str)


def test_get_recipients():
    recipients = get_recipients()
    assert recipients == ["cnsp.france@test.email"]


def test_flow(reset_test_data: None):
    state = regulations_checkup_flow(
        get_utcnow_fn=get_utcnow_mock_factory(datetime.datetime(2031, 5, 19, 11, 14)),
        get_dead_links_fn=mock_get_dead_links,
        send_message_fn=mock_send_message,
        return_state=True,
    )

    assert state.is_completed()

    # Check email headers
    email = state.result()
    assert isinstance(email, EmailMessage)
    assert (
        email["subject"]
        == "[Monitorfish] Suivi des modifications Legipêche dans Monitorfish"
    )
    assert email["From"] == "monitorfish@test.email"
    assert email["To"] == "cnsp.france@test.email"
    assert email["content-type"] == 'text/html; charset="utf-8"'

    # Check email content
    html = email.get_content()

    test_file_location = TEST_DATA_LOCATION / "emails/REGULATIONS_CHECKUP.html"
    with open(test_file_location, "r") as f:
        expected_html = f.read()

    assert html == expected_html
