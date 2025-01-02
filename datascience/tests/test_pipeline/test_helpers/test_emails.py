import io
from datetime import datetime

import dateutil
from pypdf import PdfReader
from pytest import fixture

from config import TEST_DATA_LOCATION
from src.pipeline.helpers.emails import create_html_email, resize_pdf_to_A4


@fixture
def A3_pdf() -> bytes:
    A3_pdf_filepath = TEST_DATA_LOCATION / "emails/A3.pdf"
    with open(A3_pdf_filepath, "rb") as f:
        A3_pdf_file = f.read()
    return A3_pdf_file


def test_resize_pdf_to_A4(A3_pdf):
    A3_pdf_object = PdfReader(io.BytesIO(A3_pdf))
    resized_pdf = resize_pdf_to_A4(A3_pdf)
    resized_pdf_object = PdfReader(io.BytesIO(resized_pdf))

    assert len(A3_pdf_object.pages) == 1
    assert len(resized_pdf_object.pages) == 1

    A3_page = A3_pdf_object.pages[0]
    resized_page = resized_pdf_object.pages[0]

    assert A3_page.mediabox.width == 841.889764
    assert A3_page.mediabox.height == 1190.551181
    assert resized_page.mediabox.width == 595.275591
    assert resized_page.mediabox.height == 841.889764


def test_create_html_email():
    now = datetime.now().astimezone()
    msg = create_html_email(
        to=["someone@blabla.email"],
        subject="Something",
        html="I want you to know that",
        cc="ccsomeone@blabla.email",
        bcc="bccsomeone@blabla.email",
        reply_to="notme@blabla.email",
    )

    assert msg["To"] == "someone@blabla.email"
    assert msg["Subject"] == "Something"
    assert msg["Cc"] == "ccsomeone@blabla.email"
    assert msg["Bcc"] == "bccsomeone@blabla.email"
    assert msg["Reply-To"] == "notme@blabla.email"

    parsed_date = dateutil.parser.parse(msg["Date"])
    assert (now - parsed_date).total_seconds() < 10
