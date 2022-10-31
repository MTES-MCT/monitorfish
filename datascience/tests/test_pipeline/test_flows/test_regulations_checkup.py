from datetime import datetime
from email.message import EmailMessage
from unittest.mock import patch

import jinja2
import pandas as pd
import pytest
import requests
from prefect import task

from config import TEST_DATA_LOCATION
from src.pipeline.flows.regulations_checkup import (
    extract_legipeche_regulations,
    extract_monitorfish_regulations,
    flow,
    format_dead_links,
    get_body_template,
    get_dead_links,
    get_extraction_datetimes,
    get_main_template,
    get_missing_references,
    get_modified_regulations,
    get_recipients,
    get_style,
    get_unknown_links,
    make_html_hyperlinks,
    transform_modified_regulations,
)


@task(checkpoint=False)
def mock_send_message(msg: EmailMessage):
    assert isinstance(msg, EmailMessage)


flow.replace(flow.get_tasks("send_message")[0], mock_send_message)


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
            ],
            "topic": [
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Morbihan - bivalves",
                "Mediterranée - filets",
                "Mediterranée - filets",
                "Mediterranée - filets",
            ],
            "zone": [
                "Secteur 1",
                "Secteur 2",
                "Secteur 2",
                "Zone A",
                "Zone B",
                "Zone C",
            ],
            "url": [
                None,
                "http://some.url",
                "http://some.other.url",
                None,
                "http://regulation.url",
                "http://dead_link.regulation.url",
            ],
            "reference": [
                None,
                "some regulation",
                "some other regulation",
                None,
                "Med regulation",
                "Dead link regulation",
            ],
        }
    )
    return regulations


@pytest.fixture
def legipeche_regulations() -> pd.DataFrame:

    d1 = datetime(2021, 3, 2, 14, 25, 0)
    d2 = datetime(2021, 3, 3, 14, 25, 0)

    regulations = pd.DataFrame(
        {
            "extraction_datetime_utc": [d1, d1, d1, d1, d1, d2, d2, d2, d1, d2, d2, d2],
            "extraction_occurence": [
                "previous",
                "previous",
                "previous",
                "previous",
                "previous",
                "latest",
                "latest",
                "latest",
                "previous",
                "latest",
                "latest",
                "latest",
            ],
            "page_title": [
                "Some old page",
                "Med. sea regulation",
                "Bretagne regulation",
                "Bretagne other reg",
                "Bretagne other reg",
                "Bretagne other reg",
                "Bretagne other reg",
                "Bretagne regulation",
                "Unused regulation",
                "Med. sea regulation",
                "Unused regulation",
                "Unused regulation 2",
            ],
            "page_url": [
                "http://dead_link.regulation.url",
                "http://regulation.url",
                "http://some.url",
                "http://some.other.url",
                "http://some.other.url",
                "http://some.other.url",
                "http://some.other.url",
                "http://some.url",
                "http://unused.url",
                "http://regulation.url",
                "http://unused.url",
                "http://unused_2.url",
            ],
            "document_title": [
                "Some old reg text",
                "Med reg text",
                "Bretagne reg text",
                "Bretagne other reg 1",
                "Bretagne other reg 2",
                "Bretagne other reg 1",
                "Bretagne other reg 3",
                "Bretagne reg text",
                "Unused reg text",
                "Med reg text",
                "Unused reg text",
                "Unused reg text",
            ],
            "document_url": [
                "http://some.thing",
                "http://med.reg",
                "http://bzh.reg",
                "http://bzh.other_1",
                "http://bzh.other_2",
                "http://bzh.other_1",
                "http://bzh.other_3",
                "http://bzh.reg",
                "http://unused.reg",
                "http://med.reg",
                "http://unused.reg",
                "http://unused2.reg",
            ],
        }
    )

    return regulations


@pytest.fixture
def modified_regulations(legipeche_regulations) -> pd.DataFrame:
    return legipeche_regulations.iloc[[4, 6]].reset_index(drop=True)


@pytest.fixture
def transformed_regulations() -> pd.DataFrame:
    regulations = pd.DataFrame(
        {
            "Type de réglementation": ["Reg. Facade 1", "Reg. Facade 1"],
            "Thématique": ["Morbihan - bivalves", "Morbihan - bivalves"],
            "Zone": ["Secteur 2", "Secteur 2"],
            "Référence réglementaire": [
                '<a href="http://some.other.url">some other regulation</a>',
                '<a href="http://some.other.url">some other regulation</a>',
            ],
            "Modification": ["Ajout de document", "Suppression de document"],
            "Document": [
                '<a href="http://bzh.other_3">Bretagne other reg 3</a>',
                '<a href="http://bzh.other_2">Bretagne other reg 2</a>',
            ],
        }
    )

    return regulations


@pytest.fixture
def missing_references() -> pd.DataFrame:
    references = pd.DataFrame(
        {
            "Type de réglementation": ["Reg. Facade 1", "Reg. Facade 2"],
            "Thématique": ["Morbihan - bivalves", "Mediterranée - filets"],
            "Zone": ["Secteur 1", "Zone A"],
        }
    )
    return references


@pytest.fixture
def unknown_links() -> set:
    return {"http://dead_link.regulation.url"}


@pytest.fixture
def dead_links(monitorfish_regulations) -> pd.DataFrame:
    return monitorfish_regulations.iloc[[-1]].reset_index(drop=True)


@pytest.fixture
def formatted_dead_links():
    links = pd.DataFrame(
        {
            "Type de réglementation": ["Reg. Facade 2"],
            "Thématique": ["Mediterranée - filets"],
            "Zone": ["Zone C"],
            "Référence réglementaire": [
                '<a href="http://dead_link.regulation.url">Dead link regulation</a>'
            ],
        }
    )
    return links


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


def test_extract_monitorfish_regulations(reset_test_data, monitorfish_regulations):
    regulations = extract_monitorfish_regulations.run()

    pd.testing.assert_frame_equal(regulations, monitorfish_regulations)


def test_extract_legipeche_regulations(reset_test_data, legipeche_regulations):
    regulations = extract_legipeche_regulations.run()
    pd.testing.assert_frame_equal(regulations, legipeche_regulations)


def test_get_extraction_datetimes(legipeche_regulations):
    d1_string, d2_string = get_extraction_datetimes.run(legipeche_regulations)
    assert d1_string == "02/03/2021 15:25"
    assert d2_string == "03/03/2021 15:25"


def test_get_modified_regulations(
    legipeche_regulations, monitorfish_regulations, modified_regulations
):
    regulations = get_modified_regulations.run(
        legipeche_regulations, monitorfish_regulations
    )

    pd.testing.assert_frame_equal(regulations, modified_regulations)


def test_transform_modified_regulations(
    monitorfish_regulations, modified_regulations, transformed_regulations
):
    regulations = transform_modified_regulations.run(
        modified_regulations, monitorfish_regulations
    )
    pd.testing.assert_frame_equal(regulations, transformed_regulations)


def test_get_missing_references(monitorfish_regulations, missing_references):
    references = get_missing_references.run(monitorfish_regulations)

    pd.testing.assert_frame_equal(references, missing_references)


def test_get_unknown_links(
    monitorfish_regulations, legipeche_regulations, unknown_links
):
    links = get_unknown_links.run(monitorfish_regulations, legipeche_regulations)
    assert links == unknown_links


@patch("src.pipeline.flows.regulations_checkup.requests")
def test_get_dead_links(
    mock_requests, monitorfish_regulations, unknown_links, dead_links
):
    def failed_get(url):
        r = requests.Response()
        r.status_code = 404
        r.url = url
        return r

    mock_requests.get.side_effect = failed_get

    links = get_dead_links.run(monitorfish_regulations, unknown_links)
    mock_requests.get.assert_called_once_with("http://dead_link.regulation.url")
    pd.testing.assert_frame_equal(links, dead_links)


def test_format_dead_links(dead_links, formatted_dead_links):
    formatted_links = format_dead_links.run(dead_links)
    pd.testing.assert_frame_equal(formatted_links, formatted_dead_links)


def test_get_main_template():
    main_template = get_main_template.run()
    assert isinstance(main_template, jinja2.Template)


def test_get_body_template():
    body_template = get_body_template.run()
    assert isinstance(body_template, jinja2.Template)


def test_get_style():
    style = get_style.run()
    assert isinstance(style, str)


def test_get_recipients():
    recipients = get_recipients.run()
    assert recipients == ["cnsp.france@test.email"]


def test_flow(reset_test_data):
    flow.schedule = None
    state = flow.run()

    assert state.is_successful()

    # Check email content
    html = state.result[flow.get_tasks("render_main")[0]].result

    test_file_location = TEST_DATA_LOCATION / "emails/REGULATIONS_CHECKUP.html"
    with open(test_file_location, "r") as f:
        expected_html = f.read()

    assert html == expected_html

    # Check email headers
    email = state.result[flow.get_tasks("create_message")[0]].result
    assert isinstance(email, EmailMessage)
    assert (
        email["subject"]
        == "[Monitorfish] Suivi des modifications Legipêche dans Monitorfish"
    )
    assert email["From"] == "monitorfish@test.email"
    assert email["To"] == "cnsp.france@test.email"
    assert email["content-type"] == 'text/html; charset="utf-8"'
