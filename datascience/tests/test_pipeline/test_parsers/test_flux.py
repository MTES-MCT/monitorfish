import datetime
import os
import unittest

from config import TEST_DATA_LOCATION
from src.pipeline.parsers.flux.flux import FLUXParsingError, parse_xml_document

XML_TEST_DATA_LOCATION = TEST_DATA_LOCATION / "flux/business"


class TestLogParsers(unittest.TestCase):
    def parse_file(self, test_file: str, has_data: bool = False):
        with open(os.path.join(XML_TEST_DATA_LOCATION, test_file), "r") as f:
            xml_string = f.read()
        res = parse_xml_document(xml_string,False)
        metadata = res[0][0]
        data_iter = res[0][1]
        data_list = list(data_iter)
        return metadata, data_list

    def test_cox_parser(self):
        unittest.TestCase.maxDiff=None
        test_file = "FLUX-FA-EU-710911 - Area exit declaration.xml"
        metadata, data_list = self.parse_file(test_file)

        expected_metadata = {
            "operation_number": "a3c52754-97e1-4a21-ba2e-d8f16f4544e9",
            "operation_datetime_utc": datetime.datetime(2020, 5, 6, 15, 40, 57),
            "operation_type": "DAT",
            "flux_id": "9d1ddd34-1394-470e-b8a6-469b86150e1e",
            "flux_datetime_utc": datetime.datetime(2020, 5, 6, 13, 40, 57),
            "cfr": "CYP123456789",
            "ircs": None,
            "external_identification": None,
            "vessel_name": None,
            "flag_state": "CYP",
            "imo": None,
            "trip_number": "SRC-TRP-TTT20200506194057580",
        }

        self.assertEqual(metadata, expected_metadata)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "COX")
        value = data["value"]
        expected_value = {
            "effortZoneExitDatetimeUtc": "2020-05-06T11:40:57.580Z",
            "targetSpeciesOnExit": None,
            "faoZoneExited": None,
            "economicZoneExited": None,
            "statisticalRectangleExited": None,
            "effortZoneExited": "A",
            "latitudeExited": 46.678,
            "longitudeExited": -14.616,
        }
        self.assertEqual(value, expected_value)

    def test_dep_parser(self):
        self.maxDiff = None
        test_file = "FLUX-FA-EU-710301 - Departure (Catch onboard).xml"
        metadata, data_list = self.parse_file(test_file)
        print(metadata)
        print(data_list)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "DEP")
        value = data["value"]
        expected_value = {
            "departureDatetimeUtc": "2020-05-06T11:39:33.176Z",
            "departurePort": "ESCAR",
            "anticipatedActivity": "FIS",
            "gearOnboard": [
                {"gear": "PS", "mesh": 140.0, "dimensions": 14.0}
            ],
            "speciesOnboard": [
                {
                    "species": "COD",
                    "weight": 50.0,
                    "nbFish": None,
                    "economicZone": "ESP",
                    "faoZone": "27.9.b.2",
                    "presentation": "GUT",
                    "packaging": "BOX",
                    "preservationState": "FRO",
                    "conversionFactor": 1.1,
                }
            ]
        }
        self.assertEqual(value, expected_value)

    def test_dis_parser(self):
        test_file = "FLUX-FA-EU-710701 - Discard operation.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "DIS")
        value = data["value"]
        expected_value = {
            "discardDatetimeUtc": "2020-05-06T11:40:34.449Z",
            "catches": [
                {
                    "species": "COD",
                    "weight": 100,
                    "nbFish": None
                }
            ],
        }
        self.assertEqual(value, expected_value)

    def test_tra_parser(self):
        test_file = "FLUX-FA-EU-711301 - Transhipment (in port) declaration by receiver.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data, {"log_type": "TRA"})

    def test_rtp_parser(self):
        test_file = "FLUX-FA-EU-711102 - Arrival declaration (Reason = Landing).xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "RTP")
        value = data["value"]
        expected_value = {
            "returnDatetimeUtc": "2020-05-06T11:41:20.712Z",
            "port": "ESCAR",
            "reasonOfReturn": "LAN",
            "gearOnboard": [{"gear": "GN", "mesh": 140.0, "dimensions": 1000.0}],
        }
        self.assertEqual(value, expected_value)

    def test_parse_empty_message(self):
        test_file = "empty_message.xml"
        self.assertRaises(FLUXParsingError, self.parse_file, test_file)
