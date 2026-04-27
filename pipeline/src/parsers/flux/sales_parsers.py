import logging
import xml.etree.ElementTree as ET
from typing import List, Optional, Tuple
from xml.etree.ElementTree import ParseError

from src.parsers.utils import try_float

NS_FLUX_SALES = {
    "": "urn:un:unece:uncefact:data:standard:FLUXSalesReportMessage:3",
    "rsm": "urn:un:unece:uncefact:data:standard:FLUXSalesReportMessage:3",
    "ram": "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:20",
    "udt": "urn:un:unece:uncefact:data:standard:UnqualifiedDataType:20",
}


def _find(el: ET.Element, path: str) -> Optional[ET.Element]:
    return el.find(path, NS_FLUX_SALES)


def _findall(el: ET.Element, path: str) -> List[ET.Element]:
    return el.findall(path, NS_FLUX_SALES)


def _get(el: ET.Element, path: str) -> Optional[str]:
    found = _find(el, path)
    return found.text if found is not None else None


def _make_datetime(date_str: Optional[str]):
    from src.parsers.flux.utils import make_datetime

    return make_datetime(date_str)


def parse_product(product: ET.Element) -> dict:
    return {
        "species": _get(product, './ram:SpeciesCode[@listID="FAO_SPECIES"]'),
        "weight": try_float(_get(product, './ram:WeightMeasure[@unitCode="KGM"]')),
        "usage": _get(product, './ram:UsageCode[@listID="PROD_USAGE"]'),
        "freshness": _get(
            product, './ram:AppliedAAPProcess/ram:TypeCode[@listID="FISH_FRESHNESS"]'
        ),
        "preservationState": _get(
            product,
            './ram:AppliedAAPProcess/ram:TypeCode[@listID="FISH_PRESERVATION"]',
        ),
        "presentation": _get(
            product,
            './ram:AppliedAAPProcess/ram:TypeCode[@listID="FISH_PRESENTATION"]',
        ),
        "totalPrice": try_float(
            _get(product, "./ram:TotalSalesPrice/ram:ChargeAmount")
        ),
        "sizeCategory": _get(
            product,
            './ram:SpecifiedSizeDistribution/ram:CategoryCode[@listID="FISH_SIZE_CATEGORY"]',
        ),
        "sizeClass": _get(
            product,
            './ram:SpecifiedSizeDistribution/ram:ClassCode[@listID="FISH_SIZE_CLASS"]',
        ),
        "faoZone": _get(
            product, './ram:OriginFLUXLocation/ram:ID[@schemeID="FAO_AREA"]'
        ),
    }


def parse_sales_document(
    doc: ET.Element,
) -> Tuple[dict, dict, Optional[str], Optional[str]]:
    """Parse IncludedSalesDocument.

    Returns:
        (value_dict, vessel_dict, trip_number, sales_datetime_utc_str)
    """
    products = [
        parse_product(p)
        for p in _findall(doc, "./ram:SpecifiedSalesBatch/ram:SpecifiedAAPProduct")
    ]

    parties = {}
    for party in _findall(doc, "./ram:SpecifiedSalesParty"):
        role = _get(party, './ram:RoleCode[@listID="FLUX_SALES_PARTY_ROLE"]')
        if role is None:
            role = _get(party, './ram:TypeCode[@listID="FLUX_SALES_PARTY_ROLE"]')
        if role:
            parties[role.lower()] = {
                "name": _get(party, "./ram:Name"),
                "id": _get(party, "./ram:ID"),
            }

    sales_datetime_utc_str = _get(
        doc, "./ram:SpecifiedSalesEvent/ram:OccurrenceDateTime/udt:DateTime"
    )

    value = {
        "salesId": _get(doc, './ram:ID[@schemeID="EU_SALES_ID"]'),
        "currency": _get(doc, './ram:CurrencyCode[@listID="TERRITORY_CURR"]'),
        "salesDatetimeUtc": sales_datetime_utc_str,
        "landingPort": _get(
            doc, './ram:SpecifiedFLUXLocation/ram:ID[@schemeID="LOCATION"]'
        ),
        "landingDatetimeUtc": _get(
            doc,
            "./ram:SpecifiedFishingActivity/ram:SpecifiedDelimitedPeriod/ram:StartDateTime/udt:DateTime",
        ),
        "products": products,
        **parties,
    }

    vessel = _find(
        doc, "./ram:SpecifiedFishingActivity/ram:RelatedVesselTransportMeans"
    )
    vessel_data = {}
    trip_number = None
    if vessel is not None:
        vessel_data = {
            "cfr": _get(vessel, './ram:ID[@schemeID="CFR"]'),
            "vessel_name": _get(vessel, "./ram:Name"),
            "flag_state": _get(
                vessel,
                './ram:RegistrationVesselCountry/ram:ID[@schemeID="TERRITORY"]',
            ),
        }
        trip_number = _get(
            doc,
            './ram:SpecifiedFishingActivity/ram:SpecifiedFishingTrip/ram:ID[@schemeID="EU_TRIP_ID"]',
        )

    return value, vessel_data, trip_number, sales_datetime_utc_str


def parse_flux_sales_report_message_string(
    message_string: str,
) -> Tuple[str, List[dict]]:
    from src.parsers.flux.flux import FLUXParsingError, get_operation_type

    try:
        root = ET.fromstring(message_string)
    except ParseError as e:
        raise FLUXParsingError("Could not parse xml string: ", e)

    flux_doc = _find(root, "FLUXReportDocument")
    if flux_doc is None:
        raise FLUXParsingError(
            "Could not find FLUXReportDocument in FLUXSalesReportMessage"
        )

    operation_number = _get(flux_doc, './ram:ID[@schemeID="UUID"]')
    operation_datetime_utc = _make_datetime(
        _get(flux_doc, "./ram:CreationDateTime/udt:DateTime")
    )

    operation_data = {
        "operation_number": operation_number,
        "operation_datetime_utc": operation_datetime_utc,
    }
    report_data = {
        "operation_type": get_operation_type(flux_doc),
        "report_id": operation_number,
        "referenced_report_id": _get(flux_doc, './ram:ReferencedID[@schemeID="UUID"]'),
        "report_datetime_utc": operation_datetime_utc,
    }

    sales_reports = _findall(root, "SalesReport")

    if not sales_reports:
        return operation_number, [
            {
                **operation_data,
                **report_data,
                "log_type": None,
                "activity_datetime_utc": None,
                "trip_number": None,
                "value": None,
            }
        ]

    message_data = []
    for sales_report in sales_reports:
        sales_type = _get(sales_report, './ram:ItemTypeCode[@listID="FLUX_SALES_TYPE"]')
        doc = _find(sales_report, "./ram:IncludedSalesDocument")

        if doc is not None:
            try:
                (
                    value,
                    vessel_data,
                    trip_number,
                    sales_datetime_str,
                ) = parse_sales_document(doc)
                activity_datetime_utc = _make_datetime(sales_datetime_str)
            except Exception:
                logging.error(
                    "Could not parse sales document. This report will be skipped."
                )
                continue
        else:
            value = None
            vessel_data = {}
            trip_number = None
            activity_datetime_utc = None

        message_data.append(
            {
                **operation_data,
                **report_data,
                "log_type": sales_type,
                "activity_datetime_utc": activity_datetime_utc,
                "trip_number": trip_number,
                "value": value,
                **vessel_data,
            }
        )

    return operation_number, message_data
