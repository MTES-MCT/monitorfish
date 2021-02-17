import datetime
import os
import unittest

from config import ROOT_DIRECTORY
from src.pipeline.parsers.ers import ERSParsingError, parse_xml_string

TEST_DATA_DIRECTORY = ROOT_DIRECTORY / "test/test_data/ers"


class TestLogParsers(unittest.TestCase):
    def parse_file(self, test_file: str, has_data: bool = False):
        with open(os.path.join(TEST_DATA_DIRECTORY, test_file), "r") as f:
            xml_string = f.read()
        metadata, data_iter = parse_xml_string(xml_string)
        data_list = list(data_iter)
        return metadata, data_list

    def test_cor_parser(self):
        test_file = "{'OPS':{'COR':{'ERS':{'LOG':['LAN','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)

        expected_metadata = {
            "operation_number": "OOE20200402018600",
            "operation_country": "OOE",
            "operation_datetime_utc": datetime.datetime(2020, 4, 2, 8, 57),
            "operation_type": "COR",
            "referenced_ers_id": "OOE20200401018605",
            "ers_id": "OOE20200402018600",
            "ers_datetime_utc": datetime.datetime(2020, 4, 2, 8, 57),
            "cfr": "un id",
            "ircs": "un call sign",
            "external_identification": "marqueur externe",
            "vessel_name": "Nom de navire",
            "flag_state": "FRA",
            "imo": None,
            "trip_number": "20200057",
        }

        self.assertEqual(metadata, expected_metadata)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "LAN")
        value = data["value"]
        self.assertEqual(
            set(value), {"landingDatetimeUtc", "port", "sender", "catchLanded"}
        )
        self.assertEqual(value["landingDatetimeUtc"], "2020-04-01T17:43:00Z")
        self.assertEqual(value["port"], "FRARC")
        self.assertEqual(value["sender"], "MAS")
        catch_landed = value["catchLanded"]
        self.assertEqual(len(catch_landed), 20)

    def test_cox_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['COX','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)

        expected_metadata = {
            "operation_number": "OOE20200323034701",
            "operation_country": "OOE",
            "operation_datetime_utc": datetime.datetime(2020, 3, 23, 6, 8),
            "operation_type": "DAT",
            "ers_id": "OOE20200323034701",
            "ers_datetime_utc": datetime.datetime(2020, 3, 23, 6, 8),
            "cfr": "un id",
            "ircs": "call sign",
            "external_identification": "marqueur externe",
            "vessel_name": "un navire",
            "flag_state": "FRA",
            "imo": None,
            "trip_number": "20200032",
        }

        self.assertEqual(metadata, expected_metadata)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "COX")
        value = data["value"]
        expected_value = {
            "effortZoneExitDatetimeUtc": "2020-03-23T06:08:00Z",
            "targetSpeciesOnExit": None,
            "faoZoneExited": "27.8.c",
            "economicZoneExited": "ESP",
            "statisticalRectangleExited": "17E3",
            "effortZoneExited": None,
            "latitudeExited": 44.495,
            "longitudeExited": -6.768,
        }
        self.assertEqual(value, expected_value)

    def test_cro_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['CRO','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "CRO")
        value = data["value"]
        expected_value = {
            "effortZoneEntryDatetimeUtc": "2020-03-23T22:10:00Z",
            "targetSpeciesOnEntry": None,
            "faoZoneEntered": "27.8.c",
            "economicZoneEntered": "ESP",
            "statisticalRectangleEntered": "17E1",
            "effortZoneEntered": "C",
            "latitudeEntered": 44.489,
            "longitudeEntered": -8.797,
            "effortZoneExitDatetimeUtc": "2020-03-23T22:05:00Z",
            "targetSpeciesOnExit": None,
            "faoZoneExited": "27.8.c",
            "economicZoneExited": "ESP",
            "statisticalRectangleExited": "17E1",
            "effortZoneExited": "C",
            "latitudeExited": 44.505,
            "longitudeExited": -8.786,
        }
        self.assertEqual(value, expected_value)

    def test_dep_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['DEP','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "DEP")
        value = data["value"]
        expected_value = {
            "departureDatetimeUtc": "2020-03-24T10:50:00Z",
            "departurePort": "GBPHD",
            "anticipatedActivity": "FSH",
            "gearOnboard": [
                {"gear": "PTB", "mesh": 120.0, "dimensions": 120.0},
                {"gear": "PTB", "mesh": 120.0, "dimensions": 120.0},
            ],
        }
        self.assertEqual(value, expected_value)

    def test_dis_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['DIS','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "DIS")
        value = data["value"]
        expected_value = {
            "discardDatetimeUtc": "2020-03-21T22:07:00Z",
            "catches": [
                {
                    "species": "GAG",
                    "weight": 70.0,
                    "nbFish": None,
                    "faoZone": "27.7.j.2",
                    "economicZone": "IRL",
                    "statisticalRectangle": "30D9",
                    "effortZone": None,
                    "presentation": "WHL",
                    "packaging": None,
                    "freshness": None,
                    "preservationState": "ALI",
                    "conversionFactor": 1.0,
                },
                {
                    "species": "RJB",
                    "weight": 130.0,
                    "nbFish": None,
                    "faoZone": "27.7.j.2",
                    "economicZone": "IRL",
                    "statisticalRectangle": "30D9",
                    "effortZone": None,
                    "presentation": "WHL",
                    "packaging": None,
                    "freshness": None,
                    "preservationState": "ALI",
                    "conversionFactor": 1.0,
                },
            ],
        }
        self.assertEqual(value, expected_value)

    def test_eof_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['EOF','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "EOF")
        value = data["value"]
        expected_value = {"endOfFishingDatetimeUtc": "2020-03-24T17:15:00Z"}
        self.assertEqual(value, expected_value)

    def test_far_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['FAR','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "FAR")
        value = data["value"]
        self.assertEqual(
            set(value), {"dimensions", "farDatetimeUtc", "gear", "mesh", "catches"}
        )
        self.assertIs(value["dimensions"], None)
        self.assertEqual(value["farDatetimeUtc"], "2020-03-24T20:46:00Z")
        self.assertEqual(value["gear"], "OTT")
        self.assertEqual(value["mesh"], 80.0)
        self.assertEqual(value["dimensions"], None)

    def test_ins_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['INS','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data, {"log_type": "INS"})

    def test_pnt_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['PNT','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data, {"log_type": "PNT"})

    def test_rlc_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['RLC','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data, {"log_type": "RLC"})

    def test_tra_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['TRA','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data, {"log_type": "TRA"})

    def test_pno_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['PNO','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "PNO")
        value = data["value"]
        self.assertEqual(
            set(value),
            {
                "catchOnboard",
                "predictedArrivalDatetimeUtc",
                "tripStartDate",
                "port",
                "purpose",
            },
        )
        self.assertEqual(value["predictedArrivalDatetimeUtc"], "2020-03-26T12:44:00Z")
        self.assertEqual(value["port"], "FRQUI")
        self.assertEqual(value["purpose"], "LAN")
        self.assertEqual(value["tripStartDate"], "2020-03-26T00:00:00Z")

    def test_rtp_parser(self):
        test_file = "{'OPS':{'DAT':{'ERS':{'LOG':['RTP','ELOG']}}}}.xml"
        metadata, data_list = self.parse_file(test_file)
        self.assertEqual(len(data_list), 1)
        data = data_list[0]
        self.assertEqual(data["log_type"], "RTP")
        value = data["value"]
        expected_value = {
            "returnDatetimeUtc": "2020-03-25T07:30:00Z",
            "port": "SCPOV",
            "reasonOfReturn": "LAN",
            "gearOnboard": [{"gear": "PS", "mesh": 110.0, "dimensions": None}],
        }
        self.assertEqual(value, expected_value)

    def test_parse_empty_message(self):
        test_file = "empty_message.xml"
        self.assertRaises(ERSParsingError, self.parse_file, test_file)

    def test_del_parser(self):
        test_file = "{'OPS':'DEL'}.xml"
        metadata, data_list = self.parse_file(test_file)

        expected_metadata = {
            "operation_number": "OOF20200321016003",
            "operation_country": "OOF",
            "operation_datetime_utc": datetime.datetime(2020, 3, 21, 13, 39),
            "operation_type": "DEL",
            "referenced_ers_id": "OOF20200321016002",
        }
        self.assertEqual(metadata, expected_metadata)
        data = data_list[0]
        self.assertEqual(data, {"value": None})

    def test_ret_parser(self):
        test_file = "{'OPS':'RET'}.xml"
        metadata, data_list = self.parse_file(test_file)

        expected_metadata = {
            "operation_number": "FRA20200321502645",
            "operation_country": "FRA",
            "operation_datetime_utc": datetime.datetime(2020, 3, 21, 22, 14),
            "operation_type": "RET",
            "referenced_ers_id": "OOE20200321041702",
        }
        self.assertEqual(metadata, expected_metadata)
        data = data_list[0]
        self.assertEqual(data, {"value": {"returnStatus": "000"}})
