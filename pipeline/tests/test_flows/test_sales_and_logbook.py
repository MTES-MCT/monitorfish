from copy import deepcopy
from unittest.mock import patch

import pandas as pd
import pytest

from config import TEST_DATA_LOCATION
from src.entities.data_exchange_standards import DataDomain
from src.flows.sales_and_logbook import (
    TransmissionFormat,
    ZippedFileType,
    clean,
    extract_xmls_from_zipfile,
    extract_zipfiles,
    get_zipped_file_type,
    parse_xmls,
    sales_and_logbook_flow,
)
from src.read_query import read_query

ZIPFILES_TEST_DATA_LOCATION = TEST_DATA_LOCATION / "sales_and_logbook/zipfiles/"
XML_FILES_TEST_DATA_LOCATION = TEST_DATA_LOCATION / "sales_and_logbook/xml_files"


def test_get_zipped_file_type():
    assert get_zipped_file_type("UN_JBE202001123614.zip") == ZippedFileType.UN_JBE
    assert get_zipped_file_type("ERS3_JBE202102365445.zip") == ZippedFileType.ERS3_JBE
    assert (
        get_zipped_file_type("ERS3_ACK_JBE202102365445.zip")
        == ZippedFileType.ERS3_ACK_JBE
    )
    assert get_zipped_file_type("UN_NVE202102365445.zip") == ZippedFileType.UN_NVE
    assert get_zipped_file_type("ERS3_NVE202102365445.zip") == ZippedFileType.ERS3_NVE

    with pytest.raises(ValueError):
        get_zipped_file_type("Unexpected_filename_JBE123456789012.zip")
    with pytest.raises(ValueError):
        get_zipped_file_type("Unexpectedfilename")


@patch("src.flows.sales_and_logbook.move")
def test_extract_zipfiles_does_not_return_more_than_two_hundred_files(mock_move):
    TEST_DIRECTORY = (
        ZIPFILES_TEST_DATA_LOCATION / "test_extract_zipfiles/many_zipfiles/"
    )
    zipfiles = extract_zipfiles(
        input_dir=TEST_DIRECTORY / "received",
        treated_dir=TEST_DIRECTORY / "treated",
        error_dir=TEST_DIRECTORY / "error",
    )

    assert len(zipfiles) == 200
    assert set(zipfiles[0].keys()) == {
        "error_dir",
        "treated_dir",
        "full_name",
        "input_dir",
        "transmission_format",
        "data_domain",
    }

    mock_move.assert_not_called()


@patch("src.flows.sales_and_logbook.move")
def test_extract_zipfiles_handles_flux_ers3_and_unexpected_files(mock_move):
    TEST_DIRECTORY = (
        ZIPFILES_TEST_DATA_LOCATION / "test_extract_zipfiles/sample_zipfiles/"
    )

    zipfiles = extract_zipfiles(
        input_dir=TEST_DIRECTORY / "received",
        treated_dir=TEST_DIRECTORY / "treated",
        error_dir=TEST_DIRECTORY / "error",
    )

    assert mock_move.call_count == 2

    mock_move.assert_any_call(
        TEST_DIRECTORY / "received/2021/1/unexpected_non_zipfile.txt",
        TEST_DIRECTORY / "error/2021/1",
        if_exists="replace",
    )

    mock_move.assert_any_call(
        TEST_DIRECTORY / "received/2021/1/unexpected_zipfile_JBE123456789012.zip",
        TEST_DIRECTORY / "error/2021/1",
        if_exists="replace",
    )

    assert len(zipfiles) == 7
    assert {zipfile["input_dir"] for zipfile in zipfiles} == {
        TEST_DIRECTORY / "received/2021/1"
    }
    assert {zipfile["treated_dir"] for zipfile in zipfiles} == {
        TEST_DIRECTORY / "treated/2021/1"
    }
    assert {zipfile["error_dir"] for zipfile in zipfiles} == {
        TEST_DIRECTORY / "error/2021/1"
    }

    assert {
        zipfile["full_name"]: zipfile["transmission_format"] for zipfile in zipfiles
    } == {
        "UN_JBE202101123004.zip": TransmissionFormat.FLUX,
        "ERS3_JBE202101123000.zip": TransmissionFormat.ERS,
        "ERS3_ACK_JBE202101123003.zip": TransmissionFormat.ERS,
        "ERS3_JBE202101123002.zip": TransmissionFormat.ERS,
        "ERS3_JBE202101123001.zip": TransmissionFormat.ERS,
        "UN_NVE202101123001.zip": TransmissionFormat.FLUX,
        "ERS3_NVE202101123001.zip": TransmissionFormat.ERS,
    }


@pytest.mark.parametrize(
    "file_name,xml_content",
    [
        ("ERS3_JBE123456789012.zip", "This is an ERS3 message."),
        ("ERS3_ACK_JBE123456789012.zip", "This is an ERS3_ACK message."),
        ("UN_JBE123456789012.zip", "This is a UN message."),
        ("ERS3_NVE123456789012.zip", "This is an ERS3 NVE message."),
        ("UN_NVE123456789012.zip", "This is a UN NVE message."),
    ],
)
def test_extract_xmls_from_zipfile(file_name, xml_content):
    TEST_DIRECTORY = ZIPFILES_TEST_DATA_LOCATION / "test_extract_xmls"
    dummy_zipfile = {
        "full_name": file_name,
        "input_dir": TEST_DIRECTORY / "received",
        "treated_dir": TEST_DIRECTORY / "treated",
        "error_dir": TEST_DIRECTORY / "error",
        "data_domain": DataDomain.LOGBOOK,
        "transmission_format": TransmissionFormat.ERS,
    }

    xmls = extract_xmls_from_zipfile(dummy_zipfile)
    expected_xmls = deepcopy(dummy_zipfile)
    expected_xmls["xml_messages"] = [xml_content]
    assert xmls == expected_xmls


def test_parse_xmls_parses_ers3_logbook_files():
    xml_messages = []
    with open(XML_FILES_TEST_DATA_LOCATION / "logbook/ers/OOE20200324042000.xml") as f:
        xml_messages.append(f.read())
    with open(XML_FILES_TEST_DATA_LOCATION / "logbook/ers/FAC20211018001928.xml") as f:
        xml_messages.append(f.read())

    zipfile = {
        "full_name": "zipfile_name.zip",
        "input_dir": "smome/input/dir",
        "treated_dir": "some/treated/dir",
        "error_dir": "some/error/dir",
        "transmission_format": TransmissionFormat.ERS,
        "xml_messages": xml_messages,
        "data_domain": DataDomain.LOGBOOK,
    }

    parsed_zipfile = parse_xmls(zipfile)

    assert set(parsed_zipfile) == {
        "full_name",
        "input_dir",
        "treated_dir",
        "error_dir",
        "transmission_format",
        "reports",
        "raw_messages",
        "batch_generated_errors",
        "data_domain",
    }

    assert len(parsed_zipfile["raw_messages"]) == 2
    assert len(parsed_zipfile["reports"]) == 5
    assert (
        parsed_zipfile["reports"]["transmission_format"] == TransmissionFormat.ERS.value
    ).all()
    assert not parsed_zipfile["batch_generated_errors"]


def test_parse_xmls_parses_flux_logbook_files():
    xml_messages = []
    with open(
        (
            XML_FILES_TEST_DATA_LOCATION / "logbook/flux/business/FLUX-FA-EU-710511 - "
            "Haul by haul recording reported daily.xml"
        )
    ) as f:
        xml_messages.append(f.read())
    with open(
        (
            XML_FILES_TEST_DATA_LOCATION
            / "logbook/flux/business_BASE64/FLUX-FA-EU-711101 - "
            "Arrival declaration.xml"
        )
    ) as f:
        xml_messages.append(f.read())

    zipfile = {
        "full_name": "zipfile_name.zip",
        "input_dir": "smome/input/dir",
        "treated_dir": "some/treated/dir",
        "error_dir": "some/error/dir",
        "transmission_format": TransmissionFormat.FLUX,
        "xml_messages": xml_messages,
        "data_domain": DataDomain.LOGBOOK,
    }

    parsed_zipfile = parse_xmls(zipfile)

    assert set(parsed_zipfile) == {
        "full_name",
        "input_dir",
        "treated_dir",
        "error_dir",
        "transmission_format",
        "reports",
        "raw_messages",
        "batch_generated_errors",
        "data_domain",
    }

    assert len(parsed_zipfile["raw_messages"]) == 2
    assert len(parsed_zipfile["reports"]) == 2
    assert (
        parsed_zipfile["reports"]["transmission_format"]
        == TransmissionFormat.FLUX.value
    ).all()
    assert not parsed_zipfile["batch_generated_errors"]


def test_clean():
    assert clean(None) is None

    reports = pd.DataFrame(
        {
            "operation_number": [1, 1, 2, 3, 4, 5, 6],
            "operation_type": ["DAT", "DAT", "DEL", "COR", "RET", "RSP", "QUE"],
        }
    )

    expected_cleaned_logbook_reports = pd.DataFrame(
        {
            "operation_number": [1, 1, 2, 3, 4],
            "operation_type": ["DAT", "DAT", "DEL", "COR", "RET"],
        }
    )

    raw_messages = pd.DataFrame(
        {
            "operation_number": [1, 2, 3, 4, 5, 6],
            "xml_message": ["AAA", "BBB", "CCC", "DDD", "EEE", "FFF"],
        }
    )

    expected_cleaned_logbook_raw_messages = pd.DataFrame(
        {
            "operation_number": [1, 2, 3, 4],
            "xml_message": ["AAA", "BBB", "CCC", "DDD"],
        }
    )

    zipfile = {
        "full_name": "dummy.zip",
        "input_dir": "dummy_input_dir",
        "treated_dir": "dummy_treated_dir",
        "error_dir": "dummy_error_dir",
        "transmission_format": TransmissionFormat.ERS,
        "reports": reports,
        "raw_messages": raw_messages,
        "batch_generated_errors": False,
        "data_domain": DataDomain.LOGBOOK,
    }

    expected_cleaned_zipfile = {
        "full_name": "dummy.zip",
        "input_dir": "dummy_input_dir",
        "treated_dir": "dummy_treated_dir",
        "error_dir": "dummy_error_dir",
        "transmission_format": TransmissionFormat.ERS,
        "reports": expected_cleaned_logbook_reports,
        "raw_messages": expected_cleaned_logbook_raw_messages,
        "batch_generated_errors": False,
        "data_domain": DataDomain.LOGBOOK,
    }

    cleaned_zipfile = clean(zipfile)

    reports = cleaned_zipfile.pop("reports")
    expected_reports = expected_cleaned_zipfile.pop("reports")
    pd.testing.assert_frame_equal(reports, expected_reports)

    raw_messages = cleaned_zipfile.pop("raw_messages")
    expected_raw_messages = expected_cleaned_zipfile.pop("raw_messages")
    pd.testing.assert_frame_equal(raw_messages, expected_raw_messages)

    assert cleaned_zipfile == expected_cleaned_zipfile


@patch("src.flows.sales_and_logbook.move")
def test_flow(mock_move, reset_test_data):
    received_directory = (ZIPFILES_TEST_DATA_LOCATION / "test_flow/received").as_posix()
    treated_directory = (ZIPFILES_TEST_DATA_LOCATION / "test_flow/treated").as_posix()
    error_directory = (ZIPFILES_TEST_DATA_LOCATION / "test_flow/error").as_posix()

    logbook_query = "SELECT * FROM logbook_reports"
    initial_logbook_reports = read_query(logbook_query, db="monitorfish_remote")

    sales_notes_query = "SELECT * FROM sales_notes"
    sales_notes_raw_query = "SELECT * FROM sales_notes_raw_messages"
    initial_sales_notes = read_query(sales_notes_query, db="monitorfish_remote")
    initial_sales_notes_raw_messages = read_query(
        sales_notes_raw_query, db="monitorfish_remote"
    )

    state = sales_and_logbook_flow(
        received_directory=received_directory,
        treated_directory=treated_directory,
        error_directory=error_directory,
        return_state=True,
    )

    assert state.is_completed()
    final_logbook_reports = read_query(logbook_query, db="monitorfish_remote")
    final_sales_notes = read_query(sales_notes_query, db="monitorfish_remote")
    final_sales_notes_raw_messages = read_query(
        sales_notes_raw_query, db="monitorfish_remote"
    )

    assert (~initial_logbook_reports.is_test_message).sum() == 54
    assert initial_logbook_reports.is_test_message.sum() == 0

    assert (~final_logbook_reports.is_test_message).sum() == 74
    assert final_logbook_reports.is_test_message.sum() == 1
    assert (
        final_logbook_reports.loc[
            final_logbook_reports.is_test_message, "operation_number"
        ].values[0]
    ) == "FRA20200321502645"
    assert initial_logbook_reports.activity_datetime_utc.notnull().sum() == 30
    assert final_logbook_reports.activity_datetime_utc.notnull().sum() == 44

    assert len(initial_sales_notes) == 0
    assert len(initial_sales_notes_raw_messages) == 0
    assert len(final_sales_notes) == 7
    assert len(final_sales_notes_raw_messages) == 7
