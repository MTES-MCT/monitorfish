import datetime
import os

import pytest

from config import TEST_DATA_LOCATION
from src.pipeline.parsers.ers.ers import ERSParsingError, parse_xml_string

XML_TEST_DATA_LOCATION = TEST_DATA_LOCATION / "logbook/xml_files/ers"


def parse_file(test_file: str, has_data: bool = False):
    with open(os.path.join(XML_TEST_DATA_LOCATION, test_file), "r") as f:
        xml_string = f.read()
    metadata, data_iter = parse_xml_string(xml_string)
    data_list = list(data_iter)
    return metadata, data_list


def test_cor_parser():
    test_file = "OOE20200402018600.xml"
    metadata, data_list = parse_file(test_file)

    expected_metadata = {
        "software": "TurboCatch (3.5-5)",
        "operation_number": "OOE20200402018600",
        "operation_country": "OOE",
        "operation_datetime_utc": datetime.datetime(2020, 4, 2, 8, 57),
        "operation_type": "COR",
        "referenced_report_id": "OOE20200401018605",
        "report_id": "OOE20200402018600",
        "report_datetime_utc": datetime.datetime(2020, 4, 2, 8, 57),
        "cfr": "un id",
        "ircs": "CALLIT",
        "external_identification": "extmarking",
        "vessel_name": "Nom de navire",
        "flag_state": "FRA",
        "imo": None,
        "trip_number": "20200057",
    }

    assert metadata == expected_metadata
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "LAN"
    value = data["value"]
    assert set(value) == {"landingDatetimeUtc", "port", "sender", "catchLanded"}

    assert value["landingDatetimeUtc"] == "2020-04-01T17:43:00Z"
    assert value["port"] == "FRARC"
    assert value["sender"] == "MAS"
    catch_landed = value["catchLanded"]
    assert len(catch_landed) == 20


def test_cox_parser():
    test_file = "OOE20200323034701.xml"
    metadata, data_list = parse_file(test_file)

    expected_metadata = {
        "software": "TurboCatch (3.5-5)",
        "operation_number": "OOE20200323034701",
        "operation_country": "OOE",
        "operation_datetime_utc": datetime.datetime(2020, 3, 23, 6, 8),
        "operation_type": "DAT",
        "report_id": "OOE20200323034701",
        "report_datetime_utc": datetime.datetime(2020, 3, 23, 6, 8),
        "cfr": "un id",
        "ircs": "CALLME",
        "external_identification": "extmarking",
        "vessel_name": "un navire",
        "flag_state": "FRA",
        "imo": None,
        "trip_number": "20200032",
    }

    assert metadata == expected_metadata
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "COX"
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
    assert value == expected_value


def test_cro_parser():
    test_file = "OOE20200324042000.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "CRO"
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
    assert value == expected_value


def test_dep_parser():
    test_file = "OOF20200324001900.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "DEP"
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
    assert value == expected_value


def test_dis_parser():
    test_file = "OOE20200321003301.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "DIS"
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
    assert value == expected_value


def test_eof_parser():
    test_file = "OOF20200324011801.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "EOF"
    value = data["value"]
    expected_value = {"endOfFishingDatetimeUtc": "2020-03-24T17:15:00Z"}
    assert value == expected_value


def test_far_parser():
    test_file = "OOF20200324066300.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "FAR"
    value = data["value"]
    assert set(value) == {"hauls"}
    hauls = value["hauls"]
    assert len(hauls) == 1
    haul_data = hauls[0]
    assert set(haul_data) == {"dimensions", "farDatetimeUtc", "gear", "mesh", "catches"}
    assert haul_data["dimensions"] is None
    assert haul_data["farDatetimeUtc"] == "2020-03-24T20:46:00Z"
    assert haul_data["gear"] == "OTT"
    assert haul_data["mesh"] == 80.0
    assert haul_data["dimensions"] is None


def test_ins_parser():
    test_file = "OOF20200306070900.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data == {"log_type": "INS"}


def test_pnt_parser():
    test_file = "OOY20200408047904.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data == {"log_type": "PNT"}


def test_rlc_parser():
    test_file = "OOF20200331006307.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data == {"log_type": "RLC"}


def test_tra_parser():
    test_file = "OOF20200729010401.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data == {"log_type": "TRA"}


def test_pno_parser():
    test_file = "OOF20200326013602.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "PNO"
    value = data["value"]
    assert set(value) == {
        "catchOnboard",
        "predictedArrivalDatetimeUtc",
        "tripStartDate",
        "port",
        "purpose",
    }
    assert value["predictedArrivalDatetimeUtc"] == "2020-03-26T12:44:00Z"
    assert value["port"] == "FRQUI"
    assert value["purpose"] == "LAN"
    assert value["tripStartDate"] == "2020-03-26T00:00:00Z"


def test_rtp_parser():
    test_file = "OOE20200326032800.xml"
    metadata, data_list = parse_file(test_file)
    assert len(data_list) == 1
    data = data_list[0]
    assert data["log_type"] == "RTP"
    value = data["value"]
    expected_value = {
        "returnDatetimeUtc": "2020-03-25T07:30:00Z",
        "port": "SCPOV",
        "reasonOfReturn": "LAN",
        "gearOnboard": [{"gear": "PS", "mesh": 110.0, "dimensions": None}],
    }
    assert value == expected_value


def test_parse_empty_message():
    test_file = "empty_message.xml"
    with pytest.raises(ERSParsingError):
        parse_file(test_file)


def test_del_parser():
    test_file = "OOF20200321016003.xml"
    metadata, data_list = parse_file(test_file)

    expected_metadata = {
        "software": "IKTUS 4.5.8",
        "operation_number": "OOF20200321016003",
        "operation_country": "OOF",
        "operation_datetime_utc": datetime.datetime(2020, 3, 21, 13, 39),
        "operation_type": "DEL",
        "referenced_report_id": "OOF20200321016002",
    }
    assert metadata == expected_metadata
    data = data_list[0]
    assert data == {"value": None}


def test_ret_parser():
    test_file = "FRA20200321502645.xml"
    metadata, data_list = parse_file(test_file)

    expected_metadata = {
        "operation_number": "FRA20200321502645",
        "operation_country": "FRA",
        "operation_datetime_utc": datetime.datetime(2020, 3, 21, 22, 14),
        "operation_type": "RET",
        "referenced_report_id": "OOE20200321041702",
        "software": None,
    }
    assert metadata == expected_metadata
    data = data_list[0]
    assert data == {"value": {"returnStatus": "000"}}


def test_multi_line_message():
    test_file = "FAC20211018001928.xml"
    metadata, data_list = parse_file(test_file)
    expected_metadata = {
        "operation_number": "FAC20211018001928",
        "operation_country": "FAC",
        "operation_datetime_utc": datetime.datetime(2021, 10, 18, 15, 31),
        "operation_type": "DAT",
        "report_id": "FAC20211018001928",
        "report_datetime_utc": datetime.datetime(2021, 10, 18, 15, 31),
        "cfr": "Immat navire",
        "ircs": "CALL1",
        "external_identification": "AA 000000",
        "vessel_name": "Le navire qui pêche",
        "flag_state": "XXX",
        "imo": None,
        "trip_number": "21091911",
        "software": "JP/VISIOCaptures V1.0.11",
    }

    expected_data_list = [
        {
            "log_type": "DEP",
            "value": {
                "departureDatetimeUtc": "2021-09-19T18:00:00Z",
                "departurePort": "FRRTB",
                "anticipatedActivity": None,
                "gearOnboard": [{"gear": "OTB", "mesh": 75.0, "dimensions": 12.0}],
            },
        },
        {
            "log_type": "FAR",
            "value": {
                "hauls": [
                    {
                        "farDatetimeUtc": "2021-09-19T00:00:00Z",
                        "gear": "OTB",
                        "mesh": 75.0,
                        "dimensions": 12.0,
                        "catches": [
                            {
                                "species": "SQZ",
                                "weight": 30.0,
                                "nbFish": None,
                                "faoZone": "27.7.d",
                                "economicZone": None,
                                "statisticalRectangle": "27E9",
                                "effortZone": None,
                                "presentation": "WHL",
                                "packaging": None,
                                "freshness": None,
                                "preservationState": None,
                                "conversionFactor": None,
                            },
                            {
                                "species": "PLE",
                                "weight": 30.0,
                                "nbFish": None,
                                "faoZone": "27.7.d",
                                "economicZone": None,
                                "statisticalRectangle": "27E9",
                                "effortZone": None,
                                "presentation": "WHL",
                                "packaging": None,
                                "freshness": None,
                                "preservationState": None,
                                "conversionFactor": None,
                            },
                            {
                                "species": "RJC",
                                "weight": 20.0,
                                "nbFish": None,
                                "faoZone": "27.7.d",
                                "economicZone": None,
                                "statisticalRectangle": "27E9",
                                "effortZone": None,
                                "presentation": "WHL",
                                "packaging": None,
                                "freshness": None,
                                "preservationState": None,
                                "conversionFactor": None,
                            },
                        ],
                        "latitude": 0.0,
                        "longitude": 0.0,
                    }
                ]
            },
        },
        {
            "log_type": "RTP",
            "value": {
                "returnDatetimeUtc": "2021-09-19T22:15:00Z",
                "port": "FRRTB",
                "reasonOfReturn": None,
            },
        },
        {
            "log_type": "LAN",
            "value": {
                "landingDatetimeUtc": "2021-09-19T22:15:00Z",
                "port": "FRRTB",
                "sender": "MAS",
                "catchLanded": [
                    {
                        "species": "SQZ",
                        "weight": 30.0,
                        "nbFish": None,
                        "faoZone": "27.7.d",
                        "economicZone": None,
                        "statisticalRectangle": None,
                        "effortZone": None,
                        "presentation": "WHL",
                        "packaging": None,
                        "freshness": None,
                        "preservationState": None,
                        "conversionFactor": 1.0,
                    },
                    {
                        "species": "PLE",
                        "weight": 30.0,
                        "nbFish": None,
                        "faoZone": "27.7.d",
                        "economicZone": None,
                        "statisticalRectangle": None,
                        "effortZone": None,
                        "presentation": "WHL",
                        "packaging": None,
                        "freshness": None,
                        "preservationState": None,
                        "conversionFactor": 1.0,
                    },
                    {
                        "species": "RJC",
                        "weight": 20.0,
                        "nbFish": None,
                        "faoZone": "27.7.d",
                        "economicZone": None,
                        "statisticalRectangle": None,
                        "effortZone": None,
                        "presentation": "WHL",
                        "packaging": None,
                        "freshness": None,
                        "preservationState": None,
                        "conversionFactor": 1.0,
                    },
                ],
            },
        },
    ]

    assert metadata == expected_metadata
    assert data_list == expected_data_list
