import unittest
from pathlib import Path
from unittest.mock import patch

import pandas as pd

from config import TEST_DATA_LOCATION
from src.pipeline.flows.ers import (
    clean,
    extract_xmls_from_zipfile,
    extract_zipfiles,
    flow,
    get_message_type,
    parse_xmls,
)

ZIPFILES_TEST_DATA_LOCATION = TEST_DATA_LOCATION / "ers/zipfiles/"


class TestERSFlow(unittest.TestCase):
    def test_get_message_type(self):
        self.assertEqual(get_message_type("UN_JBE202001123614.zip"), "UN")
        self.assertEqual(get_message_type("ERS3_JBE202102365445.zip"), "ERS3")
        self.assertEqual(get_message_type("ERS3_ACK_JBE202102365445.zip"), "ERS3_ACK")
        self.assertEqual(get_message_type("Unexpected_file_name"), "Unexpected_file")
        self.assertEqual(get_message_type("Unexpectedfilename"), "")

    @patch("src.pipeline.flows.ers.move")
    def test_extract_many_zipfiles(self, mock_move):

        zipfiles = extract_zipfiles.run(
            input_dir=ZIPFILES_TEST_DATA_LOCATION / "many_zipfiles/received",
            treated_dir=ZIPFILES_TEST_DATA_LOCATION / "many_zipfiles/treated",
            non_treated_dir=ZIPFILES_TEST_DATA_LOCATION / "many_zipfiles/non_treated",
            error_dir=ZIPFILES_TEST_DATA_LOCATION / "many_zipfiles/error",
        )

        self.assertEqual(len(zipfiles), 200)

        self.assertEqual(
            set(zipfiles[0].keys()),
            {"error_dir", "treated_dir", "full_name", "non_treated_dir", "input_dir"},
        )

        mock_move.assert_not_called()

    @patch("src.pipeline.flows.ers.move")
    def test_extract_unexpected_files(self, mock_move):

        zipfiles = extract_zipfiles.run(
            input_dir=ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/received",
            treated_dir=ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/treated",
            non_treated_dir=ZIPFILES_TEST_DATA_LOCATION
            / "unexpected_files/non_treated",
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

        self.assertEqual(len(zipfiles), 5)
        self.assertEqual(
            {zipfile["input_dir"] for zipfile in zipfiles},
            {ZIPFILES_TEST_DATA_LOCATION / "unexpected_files/received/2021/1"},
        )

    @patch("src.pipeline.flows.ers.move")
    def test_extract_xmls_from_ers3_zipfile(self, mock_move):

        dummy_ERS3_zipfile = {
            "full_name": "ERS3_dummy.zip",
            "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
            "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
            "non_treated_dir": ZIPFILES_TEST_DATA_LOCATION / "non_treated",
            "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
        }

        zipfiles = extract_xmls_from_zipfile.run(dummy_ERS3_zipfile)
        self.assertEqual(
            set(zipfiles.keys()),
            {
                "full_name",
                "input_dir",
                "treated_dir",
                "non_treated_dir",
                "error_dir",
                "xml_messages",
            },
        )
        self.assertEqual(zipfiles["xml_messages"], ["This is an ERS3 message."])

    @patch("src.pipeline.flows.ers.move")
    def test_extract_xmls_from_ers3_ack_zipfile(self, mock_move):
        dummy_ERS3_ACK_zipfile = {
            "full_name": "ERS3_ACK_dummy.zip",
            "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
            "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
            "non_treated_dir": ZIPFILES_TEST_DATA_LOCATION / "non_treated",
            "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
        }

        zipfiles = extract_xmls_from_zipfile.run(dummy_ERS3_ACK_zipfile)
        self.assertEqual(
            set(zipfiles.keys()),
            {
                "full_name",
                "input_dir",
                "treated_dir",
                "non_treated_dir",
                "error_dir",
                "xml_messages",
            },
        )
        self.assertEqual(zipfiles["xml_messages"], ["This is an ERS3_ACK message."])

    @patch("src.pipeline.flows.ers.move")
    def test_extract_xmls_from_un_zipfile(self, mock_move):
        dummy_UN_zipfile = {
            "full_name": "UN_dummy.zip",
            "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
            "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
            "non_treated_dir": ZIPFILES_TEST_DATA_LOCATION / "non_treated",
            "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
        }

        zipfiles = extract_xmls_from_zipfile.run(dummy_UN_zipfile)
        self.assertIsNone(zipfiles)
        mock_move.assert_called_once_with(
            ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles/UN_dummy.zip",
            ZIPFILES_TEST_DATA_LOCATION / "non_treated",
            if_exists="replace",
        )

    @patch("src.pipeline.flows.ers.move")
    def test_extract_xmls_from_unexpected_zipfile(self, mock_move):
        dummy_unexpected_zipfile = {
            "full_name": "unexpected.zip",
            "input_dir": ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles",
            "treated_dir": ZIPFILES_TEST_DATA_LOCATION / "treated",
            "non_treated_dir": ZIPFILES_TEST_DATA_LOCATION / "non_treated",
            "error_dir": ZIPFILES_TEST_DATA_LOCATION / "error",
        }

        zipfiles = extract_xmls_from_zipfile.run(dummy_unexpected_zipfile)
        self.assertIsNone(zipfiles)
        mock_move.assert_called_once_with(
            ZIPFILES_TEST_DATA_LOCATION / "test_zipfiles/unexpected.zip",
            ZIPFILES_TEST_DATA_LOCATION / "error",
            if_exists="replace",
        )

    @patch("src.pipeline.flows.ers.batch_parse")
    def test_parse_xmls(self, mock_batch_parse):
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

        self.assertEqual(
            zipfile,
            {
                "full_name": "unexpected.zip",
                "input_dir": "dummy_input_dir",
                "treated_dir": "dummy_treated_dir",
                "non_treated_dir": "dummy_non_treated_dir",
                "error_dir": "dummy_error_dir",
                "parsed": "parsed DataFrame",
                "parsed_with_xml": "parsed_with_xml DataFrame",
                "batch_generated_errors": False,
            },
        )

        self.assertIsNone(parse_xmls.run(None))

    def test_clean(self):
        self.assertIsNone(clean.run(None))

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

        self.assertEqual(
            cleaned_zipfile["parsed"].values.tolist(),
            expected_cleaned_parsed.values.tolist(),
        )

        self.assertEqual(
            cleaned_zipfile["parsed_with_xml"].values.tolist(),
            expected_cleaned_parsed_with_xml.values.tolist(),
        )
