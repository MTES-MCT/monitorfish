from unittest.mock import patch

import pandas as pd
import pytest

from config import TEST_DATA_LOCATION
from src.pipeline.flows.logbook import (
    LogbookZippedFileType,
    clean,
    extract_xmls_from_zipfile,
    extract_zipfiles,
    get_logbook_zipfile_type,
    parse_xmls,
)

ZIPFILES_TEST_DATA_LOCATION = TEST_DATA_LOCATION / "logbook/zipfiles/"


def test_get_logbook_zipfile_type():
    assert (
        get_logbook_zipfile_type("UN_JBE202001123614.zip") == LogbookZippedFileType.UN
    )
    assert (
        get_logbook_zipfile_type("ERS3_JBE202102365445.zip")
        == LogbookZippedFileType.ERS3
    )
    assert (
        get_logbook_zipfile_type("ERS3_ACK_JBE202102365445.zip")
        == LogbookZippedFileType.ERS3_ACK
    )

    with pytest.raises(ValueError):
        get_logbook_zipfile_type("Unexpected_filename_JBE123456789012.zip")
    with pytest.raises(ValueError):
        get_logbook_zipfile_type("Unexpectedfilename")


@patch("src.pipeline.flows.logbook.move")
def test_extract_many_zipfiles(mock_move):

    zipfiles = extract_zipfiles.run(
        input_dir=ZIPFILES_TEST_DATA_LOCATION / "many_zipfiles/received",
        treated_dir=ZIPFILES_TEST_DATA_LOCATION / "many_zipfiles/treated",
        error_dir=ZIPFILES_TEST_DATA_LOCATION / "many_zipfiles/error",
    )

    assert len(zipfiles) == 200
    assert set(zipfiles[0].keys()) == {
        "error_dir",
        "treated_dir",
        "full_name",
        "input_dir",
    }

    mock_move.assert_not_called()


@patch("src.pipeline.flows.logbook.move")
def test_extract_unexpected_files(mock_move):

    zipfiles = extract_zipfiles.run(
        input_dir=ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/received",
        treated_dir=ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/treated",
        error_dir=ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/error",
    )

    mock_move.assert_called_once_with(
        (
            ZIPFILES_TEST_DATA_LOCATION
            / "unexpected_files/received/2021/1/unexpected_non_zipfile.txt"
        ),
        ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/error/2021/1",
        if_exists="replace",
    )

    assert len(zipfiles) == 5
    assert {zipfile["input_dir"] for zipfile in zipfiles} == {
        ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/received/2021/1"
    }


@patch("src.pipeline.flows.logbook.move")
def test_extract_xmls_from_ers3_zipfile(mock_move):

    dummy_ERS3_zipfile = {
        "full_name": "ERS3_JBE123456789012.zip",
        "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
        "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
        "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
    }

    zipfiles = extract_xmls_from_zipfile.run(dummy_ERS3_zipfile)
    assert set(zipfiles.keys()) == {
        "full_name",
        "input_dir",
        "treated_dir",
        "error_dir",
        "xml_messages",
    }
    assert zipfiles["xml_messages"] == ["This is an ERS3 message."]


@patch("src.pipeline.flows.logbook.move")
def test_extract_xmls_from_ers3_ack_zipfile(mock_move):
    dummy_ERS3_ACK_zipfile = {
        "full_name": "ERS3_ACK_JBE123456789012.zip",
        "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
        "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
        "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
    }

    zipfiles = extract_xmls_from_zipfile.run(dummy_ERS3_ACK_zipfile)
    assert set(zipfiles.keys()) == {
        "full_name",
        "input_dir",
        "treated_dir",
        "error_dir",
        "xml_messages",
    }
    assert zipfiles["xml_messages"] == ["This is an ERS3_ACK message."]


@patch("src.pipeline.flows.logbook.move")
def test_extract_xmls_from_un_zipfile(mock_move):
    dummy_UN_zipfile = {
        "full_name": "UN_JBE123456789012.zip",
        "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
        "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
        "non_treated_dir": ZIPFILES_TEST_DATA_LOCATION / "non_treated",
        "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
    }

    zipfiles = extract_xmls_from_zipfile.run(dummy_UN_zipfile)
    assert zipfiles is None
    mock_move.assert_called_once_with(
        ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles/UN_JBE123456789012.zip",
        ZIPFILES_TEST_DATA_LOCATION / "non_treated",
        if_exists="replace",
    )


@patch("src.pipeline.flows.logbook.move")
def test_extract_xmls_from_unexpected_zipfile(mock_move):
    dummy_unexpected_zipfile = {
        "full_name": "unexpected.zip",
        "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
        "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
        "non_treated_dir": ZIPFILES_TEST_DATA_LOCATION / "non_treated",
        "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
    }

    zipfiles = extract_xmls_from_zipfile.run(dummy_unexpected_zipfile)
    assert zipfiles is None
    mock_move.assert_called_once_with(
        ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles/unexpected.zip",
        ZIPFILES_TEST_DATA_LOCATION / "error",
        if_exists="replace",
    )


@patch("src.pipeline.flows.logbook.batch_parse")
def test_parse_xmls(mock_batch_parse):
    mock_batch_parse.return_value = {
        "parsed": "parsed DataFrame",
        "parsed_with_xml": "parsed_with_xml DataFrame",
        "batch_generated_errors": False,
    }

    zipfile = {
        "full_name": "unexpected.zip",
        "input_dir": "dummy_input_dir",
        "treated_dir": "dummy_treated_dir",
        "non_treated_dir": "dummy_non_treated_dir",
        "error_dir": "dummy_error_dir",
        "xml_messages": ["Dummy xml_message"],
    }
    zipfile = parse_xmls.run(zipfile)

    assert zipfile == {
        "full_name": "unexpected.zip",
        "input_dir": "dummy_input_dir",
        "treated_dir": "dummy_treated_dir",
        "non_treated_dir": "dummy_non_treated_dir",
        "error_dir": "dummy_error_dir",
        "parsed": "parsed DataFrame",
        "parsed_with_xml": "parsed_with_xml DataFrame",
        "batch_generated_errors": False,
    }

    assert parse_xmls.run(None) is None


def test_clean():
    assert clean.run(None) is None

    parsed = pd.DataFrame(
        {
            "operation_number": [1, 1, 2, 3, 4, 5, 6],
            "operation_type": ["DAT", "DAT", "DEL", "COR", "RET", "RSP", "QUE"],
        }
    )

    expected_cleaned_parsed = pd.DataFrame(
        {
            "operation_number": [1, 1, 2, 3, 4],
            "operation_type": ["DAT", "DAT", "DEL", "COR", "RET"],
        }
    )

    parsed_with_xml = pd.DataFrame(
        {
            "operation_number": [1, 2, 3, 4, 5, 6],
            "operation_type": ["DAT", "DEL", "COR", "RET", "RSP", "QUE"],
        }
    )

    expected_cleaned_parsed_with_xml = pd.DataFrame(
        {
            "operation_number": [1, 2, 3, 4],
            "operation_type": ["DAT", "DEL", "COR", "RET"],
        }
    )

    zipfile = {
        "full_name": "dummy.zip",
        "input_dir": "dummy_input_dir",
        "treated_dir": "dummy_treated_dir",
        "non_treated_dir": "dummy_non_treated_dir",
        "error_dir": "dummy_error_dir",
        "parsed": parsed,
        "parsed_with_xml": parsed_with_xml,
        "batch_generated_errors": False,
    }

    cleaned_zipfile = clean.run(zipfile)

    assert (
        cleaned_zipfile["parsed"].values.tolist()
        == expected_cleaned_parsed.values.tolist()
    )

    assert (
        cleaned_zipfile["parsed_with_xml"].values.tolist()
        == expected_cleaned_parsed_with_xml.values.tolist()
    )
