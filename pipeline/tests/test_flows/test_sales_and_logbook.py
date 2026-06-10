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


@pytest.fixture
def expected_sales_notes() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "operation_number": [
                "128887F0-FA04-4F92-829A-36CEE114EF01",
                "128887F0-FA04-4F92-829A-36CEE114EF02",
                "29c3e26d-e1a0-4fce-a500-a78e479d4f4e",
                "3B0A058D-A12B-4B8F-A487-2B8ED2DEE2A3",
                "c45040c6-e09e-4ef4-b47a-8c7f9a45ce59",
                "FRA20260410509863",
                "NND20260427157919",
            ],
            "operation_country": [None, None, None, None, None, "FRA", "NND"],
            "operation_datetime_utc": [
                pd.Timestamp("2017-05-12 09:02:36"),
                pd.Timestamp("2017-05-12 17:04:36"),
                pd.Timestamp("2022-01-31 22:00:06"),
                pd.Timestamp("2017-05-11 12:10:38"),
                pd.Timestamp("2017-05-11 12:10:38"),
                pd.Timestamp("2026-04-10 08:47:00"),
                pd.Timestamp("2026-04-27 09:45:00"),
            ],
            "operation_type": ["COR", "DEL", "COR", "DAT", "DAT", "DAT", "DAT"],
            "report_id": [
                "128887F0-FA04-4F92-829A-36CEE114EF01",
                "128887F0-FA04-4F92-829A-36CEE114EF02",
                "29c3e26d-e1a0-4fce-a500-a78e479d4f4e",
                "3B0A058D-A12B-4B8F-A487-2B8ED2DEE2A3",
                "c45040c6-e09e-4ef4-b47a-8c7f9a45ce59",
                "FRA20260410510469",
                "NND20260427987885",
            ],
            "referenced_report_id": [
                "128887F0-FA04-4F92-829A-36CEE114EF96",
                "128887F0-FA04-4F92-829A-36CEE114EF01",
                "ee26ca74-21a7-42fd-bbd6-84149f8c7b68",
                None,
                None,
                None,
                None,
            ],
            "report_datetime_utc": [
                pd.Timestamp("2017-05-12 09:02:36"),
                pd.Timestamp("2017-05-12 17:04:36"),
                pd.Timestamp("2022-01-31 22:00:06"),
                pd.Timestamp("2017-05-11 12:10:38"),
                pd.Timestamp("2017-05-11 12:10:38"),
                pd.Timestamp("2026-04-10 07:05:00"),
                pd.Timestamp("2026-04-27 09:45:00"),
            ],
            "cfr": [
                "BEL123456789",
                None,
                "FRA000999999",
                "BEL123456789",
                "BEL123456789",
                "RYX346578713",
                "FRA000999999",
            ],
            "ircs": [None, None, "ZZZZ", None, None, "HC5098", "AAAAAA"],
            "external_identification": [
                None,
                None,
                "AA123456",
                None,
                None,
                "3-SH-01-03",
                "XR AAAA",
            ],
            "vessel_name": [
                "FAKE VESSEL",
                None,
                "FAKE VESSEL",
                "FAKE VESSEL",
                "FAKE VESSEL",
                "CBKCQHIV PGREXSSPH ZPZN",
                "VESSEL_SALE",
            ],
            "flag_state": ["BEL", None, "FRA", "BEL", "BEL", "ESP", "FRA"],
            "imo": [None, None, None, None, None, None, None],
            "sales_type": ["SN", None, "SN", "TOD", "SN", "SN", "TOD"],
            "products": [
                [
                    {
                        "usage": "HCN",
                        "weight": 6.0,
                        "faoZone": "27.3.d.24",
                        "species": "PLE",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1.31,
                        "presentation": "WHL",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 35.1,
                        "faoZone": "27.3.d.24",
                        "species": "PLE",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1.29,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 517.0,
                        "faoZone": "27.3.d.24",
                        "species": "DAB",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1.12,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 13.0,
                        "faoZone": "27.3.d.24",
                        "species": "COD",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 2.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 102.0,
                        "faoZone": "27.3.d.24",
                        "species": "FLE",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 0.82,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 9.0,
                        "faoZone": "27.7.a",
                        "species": "LIN",
                        "currency": "EUR",
                        "freshness": "E",
                        "sizeClass": "LSC",
                        "totalPrice": 3.55,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 90.1,
                        "faoZone": "27.7.b",
                        "species": "LIN",
                        "currency": "EUR",
                        "freshness": "E",
                        "sizeClass": "LSC",
                        "totalPrice": 35.55,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                ],
                None,
                [
                    {
                        "usage": "HCN",
                        "weight": 54.0,
                        "faoZone": "27.4.a",
                        "species": "USK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1809.0,
                        "presentation": "GUT",
                        "sizeCategory": "N/A",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 27.0,
                        "faoZone": "27.4.a",
                        "species": "USK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 830.25,
                        "presentation": "GUT",
                        "sizeCategory": "N/A",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 52.0,
                        "faoZone": "27.4.a",
                        "species": "MON",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 2314.0,
                        "presentation": "GUT",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 68.0,
                        "faoZone": "27.4.a",
                        "species": "MON",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 3060.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 55.0,
                        "faoZone": "27.4.a",
                        "species": "MON",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 2337.5,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 22.0,
                        "faoZone": "27.4.a",
                        "species": "MON",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 951.5,
                        "presentation": "GUT",
                        "sizeCategory": "4",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 8.5,
                        "faoZone": "27.4.a",
                        "species": "MON",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 170.0,
                        "presentation": "GUT",
                        "sizeCategory": "5",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 26.0,
                        "faoZone": "27.4.a",
                        "species": "MON",
                        "currency": "DKK",
                        "freshness": "B",
                        "sizeClass": "LSC",
                        "totalPrice": 130.0,
                        "presentation": "GUT",
                        "sizeCategory": "N/A",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 189.0,
                        "faoZone": "27.4.a",
                        "species": "WHG",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 2835.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 330.0,
                        "faoZone": "27.4.a",
                        "species": "HKE",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 18645.0,
                        "presentation": "GUT",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 88.0,
                        "faoZone": "27.4.a",
                        "species": "HKE",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 5720.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 88.0,
                        "faoZone": "27.4.a",
                        "species": "HKE",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 5412.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 22.0,
                        "faoZone": "27.4.a",
                        "species": "HKE",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1254.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 132.0,
                        "faoZone": "27.4.a",
                        "species": "HKE",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 7590.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 88.0,
                        "faoZone": "27.4.a",
                        "species": "HKE",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 3520.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 220.0,
                        "faoZone": "27.4.a",
                        "species": "HKE",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 10835.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 297.0,
                        "faoZone": "27.4.a",
                        "species": "HAD",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 9875.25,
                        "presentation": "GUT",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 810.0,
                        "faoZone": "27.4.a",
                        "species": "HAD",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 20452.5,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 540.0,
                        "faoZone": "27.4.a",
                        "species": "HAD",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 8910.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 459.0,
                        "faoZone": "27.4.a",
                        "species": "LIN",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 17097.75,
                        "presentation": "GUT",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 27.0,
                        "faoZone": "27.4.a",
                        "species": "LIN",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1147.5,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 135.0,
                        "faoZone": "27.4.a",
                        "species": "LIN",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 5467.5,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 162.0,
                        "faoZone": "27.4.a",
                        "species": "LIN",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 6358.5,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 100.0,
                        "faoZone": "27.4.a",
                        "species": "POK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 3300.0,
                        "presentation": "GUT",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 286.0,
                        "faoZone": "27.4.a",
                        "species": "POK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 9295.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 189.0,
                        "faoZone": "27.4.a",
                        "species": "POK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 6142.5,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 918.0,
                        "faoZone": "27.4.a",
                        "species": "POK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 29835.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 2484.0,
                        "faoZone": "27.4.a",
                        "species": "POK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 75141.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 6723.0,
                        "faoZone": "27.4.a",
                        "species": "POK",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 188244.0,
                        "presentation": "GUT",
                        "sizeCategory": "4",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 54.0,
                        "faoZone": "27.4.a",
                        "species": "COD",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 2565.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 104.0,
                        "faoZone": "27.4.a",
                        "species": "MEG",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 8944.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 104.0,
                        "faoZone": "27.4.a",
                        "species": "MEG",
                        "currency": "DKK",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 7852.0,
                        "presentation": "GUT",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                ],
                [
                    {
                        "usage": "UNK",
                        "weight": 6.0,
                        "faoZone": "27.3.d.24",
                        "species": "PLE",
                        "currency": "EUR",
                        "freshness": None,
                        "sizeClass": "LSC",
                        "totalPrice": 0.0,
                        "presentation": "WHL",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "UNK",
                        "weight": 36.0,
                        "faoZone": "27.3.d.24",
                        "species": "PLE",
                        "currency": "EUR",
                        "freshness": None,
                        "sizeClass": "LSC",
                        "totalPrice": 0.0,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "UNK",
                        "weight": 517.0,
                        "faoZone": "27.3.d.24",
                        "species": "DAB",
                        "currency": "EUR",
                        "freshness": None,
                        "sizeClass": "LSC",
                        "totalPrice": 0.0,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "UNK",
                        "weight": 13.0,
                        "faoZone": "27.3.d.24",
                        "species": "COD",
                        "currency": "EUR",
                        "freshness": None,
                        "sizeClass": "LSC",
                        "totalPrice": 0.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "UNK",
                        "weight": 102.0,
                        "faoZone": "27.3.d.24",
                        "species": "FLE",
                        "currency": "EUR",
                        "freshness": None,
                        "sizeClass": "LSC",
                        "totalPrice": 0.0,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "UNK",
                        "weight": 9.0,
                        "faoZone": "27.7.a",
                        "species": "LIN",
                        "currency": "EUR",
                        "freshness": None,
                        "sizeClass": "LSC",
                        "totalPrice": 0.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                ],
                [
                    {
                        "usage": "HCN",
                        "weight": 6.0,
                        "faoZone": "27.3.d.24",
                        "species": "PLE",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1.31,
                        "presentation": "WHL",
                        "sizeCategory": "1",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 36.0,
                        "faoZone": "27.3.d.24",
                        "species": "PLE",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1.29,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 517.0,
                        "faoZone": "27.3.d.24",
                        "species": "DAB",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 1.12,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 13.0,
                        "faoZone": "27.3.d.24",
                        "species": "COD",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 2.0,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 102.0,
                        "faoZone": "27.3.d.24",
                        "species": "FLE",
                        "currency": "EUR",
                        "freshness": "A",
                        "sizeClass": "LSC",
                        "totalPrice": 0.82,
                        "presentation": "WHL",
                        "sizeCategory": "2",
                        "preservationState": "FRE",
                    },
                    {
                        "usage": "HCN",
                        "weight": 9.0,
                        "faoZone": "27.7.a",
                        "species": "LIN",
                        "currency": "EUR",
                        "freshness": "E",
                        "sizeClass": "LSC",
                        "totalPrice": 3.55,
                        "presentation": "GUT",
                        "sizeCategory": "3",
                        "preservationState": "FRE",
                    },
                ],
                [
                    {
                        "weight": 8.8,
                        "faoZone": "37.1.1",
                        "species": "LTA",
                        "currency": "EUR",
                        "freshness": "A",
                        "unitPrice": 4.3,
                        "withdrawn": "N",
                        "totalPrice": 0.0,
                        "presentation": "WHL",
                        "preservationState": "FRE",
                        "productDestination": "HCN",
                    }
                ],
                [
                    {
                        "weight": 545.0,
                        "faoZone": "27.7",
                        "species": "SCE",
                        "freshness": "SO",
                        "presentation": "WHL",
                        "preservationState": "ALI",
                    }
                ],
            ],
            "sender_id": [None, None, "9999", None, None, None, None],
            "sender_name": [
                "Mr SENDER",
                None,
                "Sender",
                "Mr SENDER",
                "Mr SENDER",
                None,
                None,
            ],
            "provider_id": [None, None, None, None, None, None, None],
            "provider_name": [
                None,
                None,
                "Provider",
                None,
                None,
                "HAM DE LA ROCHELLE",
                None,
            ],
            "buyer_id": [
                "0679223791",
                None,
                "9999",
                None,
                "0679223791",
                "PC82278248963",
                None,
            ],
            "buyer_name": [
                "Mr BUYER",
                None,
                "Buyer",
                None,
                "Mr BUYER",
                "RYQATKPADLZJ HBHSCCX",
                None,
            ],
            "recipient_id": [None, None, None, "456789", None, None, None],
            "recipient_name": [None, None, None, "Mr STORAGE", None, None, None],
            "carrier_id": [None, None, None, None, None, None, None],
            "carrier_name": [None, None, None, None, None, None, None],
            "sales_datetime_utc": [
                pd.Timestamp("2017-05-10 07:05:22"),
                pd.NaT,
                pd.Timestamp("2022-01-18 06:00:00"),
                pd.Timestamp("2017-05-10 07:05:22"),
                pd.Timestamp("2017-05-10 07:05:22"),
                pd.Timestamp("2026-03-23 00:00:00"),
                pd.Timestamp("2026-04-25 00:00:00"),
            ],
            "sales_country": [None, None, None, None, None, "FRA", "FRA"],
            "sales_port_code": [
                "BEOST",
                None,
                "DKHAN",
                "BEOST",
                "BEOST",
                "FRLRH",
                "FRQUY",
            ],
            "sales_contract_reference": [None, None, None, None, None, None, None],
            "bcd_number": [None, None, None, None, None, None, None],
            "takeover_organization_name": [
                None,
                None,
                None,
                None,
                None,
                None,
                "TAKE-OVER ORGANANIZATION",
            ],
            "storage_facility_name": [
                None,
                None,
                None,
                None,
                None,
                None,
                "STORAGE FACILITY",
            ],
            "storage_facility_address": [
                None,
                None,
                None,
                None,
                None,
                None,
                "STORAGE ADDRESS",
            ],
            "transport_document_reference": [None, None, None, None, None, None, None],
            "invoice_datetime_utc": [
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2026-03-23 00:00:00"),
                pd.NaT,
            ],
            "invoice_number": [None, None, None, None, None, "320245", None],
            "takeover_contract_reference": [
                None,
                None,
                None,
                None,
                None,
                None,
                "20260425FRA000000000",
            ],
            "trip_number": [
                "BEL-TRP-2015-1435-0456",
                None,
                None,
                "BEL-TRP-2015-1435-0456",
                "BEL-TRP-2015-1435-0456",
                None,
                None,
            ],
            "sales_id": [
                "BEL-SN-2017-123456",
                None,
                "DNK-SN-00000000000000000000000",
                "BEL-TOD-2017-123457",
                "BEL-SN-2017-123456",
                None,
                None,
            ],
            "landing_port_code": [None, None, "DKHAN", None, None, "ESGAR", "FRQUY"],
            "departure_datetime_utc": [
                pd.Timestamp("2017-05-10 05:32:30"),
                pd.NaT,
                pd.Timestamp("2022-01-18 05:00:00"),
                pd.Timestamp("2017-05-10 05:32:30"),
                pd.Timestamp("2017-05-10 05:32:30"),
                pd.NaT,
                pd.NaT,
            ],
            "landing_datetime_utc": [
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2022-01-18 05:00:00"),
                pd.NaT,
                pd.NaT,
                pd.Timestamp("2026-03-18 00:00:00"),
                pd.Timestamp("2026-04-25 00:00:00"),
            ],
            "transmission_format": [
                "FLUX",
                "FLUX",
                "FLUX",
                "FLUX",
                "FLUX",
                "ERS",
                "ERS",
            ],
        }
    )


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
def test_flow(mock_move, reset_test_data, expected_sales_notes):
    received_directory = (ZIPFILES_TEST_DATA_LOCATION / "test_flow/received").as_posix()
    treated_directory = (ZIPFILES_TEST_DATA_LOCATION / "test_flow/treated").as_posix()
    error_directory = (ZIPFILES_TEST_DATA_LOCATION / "test_flow/error").as_posix()

    logbook_query = "SELECT * FROM logbook_reports"
    initial_logbook_reports = read_query(logbook_query, db="monitorfish_remote")

    sales_notes_query = "SELECT * FROM sales_notes ORDER BY operation_number"
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

    assert (~initial_logbook_reports.is_test_message).sum() == 56
    assert initial_logbook_reports.is_test_message.sum() == 0

    assert (~final_logbook_reports.is_test_message).sum() == 76
    assert final_logbook_reports.is_test_message.sum() == 1
    assert (
        final_logbook_reports.loc[
            final_logbook_reports.is_test_message, "operation_number"
        ].values[0]
    ) == "FRA20200321502645"
    assert initial_logbook_reports.activity_datetime_utc.notnull().sum() == 31
    assert final_logbook_reports.activity_datetime_utc.notnull().sum() == 45

    assert len(initial_sales_notes) == 0
    assert len(initial_sales_notes_raw_messages) == 0
    assert len(final_sales_notes) == 7
    assert len(final_sales_notes_raw_messages) == 7

    pd.testing.assert_frame_equal(
        final_sales_notes.drop(columns=["integration_datetime_utc"]),
        expected_sales_notes,
    )
