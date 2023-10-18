import io
from decimal import Decimal

from PyPDF2 import PdfReader
from pytest import fixture

from config import TEST_DATA_LOCATION
from src.pipeline.helpers.emails import resize_pdf_to_A4


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

    assert A3_page.mediabox.width == Decimal("841.889764")
    assert A3_page.mediabox.height == Decimal("1190.551181")
    assert resized_page.mediabox.width == Decimal("595.2755905511810397001681849")
    assert resized_page.mediabox.height == Decimal("841.8897637795275841199327260")
