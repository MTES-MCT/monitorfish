import base64
import gzip
import logging
import xml
import xml.etree.ElementTree as ET
from datetime import datetime
from enum import Enum
from typing import List, Tuple
from xml.etree.ElementTree import ParseError

import pandas as pd
from dateutil.parser import parse

from src.pipeline.parsers.flux.log_parsers import (
    null_parser,
    parse_coe,
    parse_cox,
    parse_dep,
    parse_dis,
    parse_far,
    parse_lan,
    parse_pno,
    parse_rtp,
)
from src.pipeline.parsers.flux.utils import (
    NS_FLUX,
    get_element,
    get_text,
    make_datetime,
)
from src.pipeline.parsers.utils import get_root_tag, tagged_children


class FLUXParsingError(Exception):
    """Raised when an FLUX message cannot be parsed."""


class FluxFAReportDocumentType(Enum):
    DECLARATION = "DECLARATION"
    NOTIFICATION = "NOTIFICATION"


class FluxFishingActivityType(Enum):
    DEPARTURE = "DEPARTURE"
    FISHING_OPERATION = "FISHING_OPERATION"
    DISCARD = "DISCARD"
    ARRIVAL = "ARRIVAL"
    LANDING = "LANDING"
    RELOCATION = "RELOCATION"
    TRANSHIPMENT = "TRANSHIPMENT"
    AREA_ENTRY = "AREA_ENTRY"
    AREA_EXIT = "AREA_EXIT"
    JOINT_FISHING_OPERATION = "JOINT_FISHING_OPERATION"
    GEAR_SHOT = "GEAR_SHOT"
    GEAR_RETRIEVAL = "GEAR_RETRIEVAL"
    START_ACTIVITY = "START_ACTIVITY"
    START_FISHING = "START_FISHING"


def get_fishing_activity_type(fishing_activity: ET.Element) -> FluxFishingActivityType:
    fishing_activity_type = get_text(
        fishing_activity, './/ram:TypeCode[@listID="FLUX_FA_TYPE"]'
    )
    try:
        res = FluxFishingActivityType[fishing_activity_type]
    except KeyError as e:
        raise FLUXParsingError("Unknown fishing activity type: ", e)
    return res


def get_fa_report_type(fa_report_document: ET.Element) -> FluxFAReportDocumentType:
    report_type = get_text(
        fa_report_document, './/ram:TypeCode[@listID="FLUX_FA_REPORT_TYPE"]'
    )
    try:
        res = FluxFAReportDocumentType[report_type]
    except KeyError as e:
        raise FLUXParsingError("Unknown report type: ", e)
    return res


def get_log_type(
    fishing_activity: ET.Element, report_type: FluxFAReportDocumentType
) -> str:
    mapping = {
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.DEPARTURE,
        ): "DEP",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.FISHING_OPERATION,
        ): "FAR",
        (FluxFAReportDocumentType.DECLARATION, FluxFishingActivityType.DISCARD): "DIS",
        (FluxFAReportDocumentType.DECLARATION, FluxFishingActivityType.ARRIVAL): "RTP",
        (FluxFAReportDocumentType.NOTIFICATION, FluxFishingActivityType.ARRIVAL): "PNO",
        (FluxFAReportDocumentType.DECLARATION, FluxFishingActivityType.LANDING): "LAN",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.RELOCATION,
        ): "RLC",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.TRANSHIPMENT,
        ): "TRA",
        (
            FluxFAReportDocumentType.NOTIFICATION,
            FluxFishingActivityType.TRANSHIPMENT,
        ): "NOT-TRA",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.AREA_ENTRY,
        ): "COE",
        (
            FluxFAReportDocumentType.NOTIFICATION,
            FluxFishingActivityType.AREA_ENTRY,
        ): "NOT-COE",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.AREA_EXIT,
        ): "COX",
        (
            FluxFAReportDocumentType.NOTIFICATION,
            FluxFishingActivityType.AREA_EXIT,
        ): "NOT-COX",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.JOINT_FISHING_OPERATION,
        ): "JFO",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.GEAR_SHOT,
        ): "GEAR_SHOT",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.GEAR_RETRIEVAL,
        ): "GEAR_RETRIEVAL",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.START_ACTIVITY,
        ): "START_ACTIVITY",
        (
            FluxFAReportDocumentType.DECLARATION,
            FluxFishingActivityType.START_FISHING,
        ): "START_FISHING",
    }
    fishing_activity_type = get_fishing_activity_type(fishing_activity)
    try:
        log_type = mapping[(report_type, fishing_activity_type)]
    except KeyError as e:
        raise FLUXParsingError(
            (
                f"Could not attribute log type to report_type '{report_type}' and "
                f"fishing_activity_type '{fishing_activity_type}'. "
            ),
            e,
        )
    return log_type


def get_operation_type(xml_element):
    purpose = get_text(xml_element, './/*[@listID="FLUX_GP_PURPOSE"]')
    purpose_operation_type_mapping = {"9": "DAT", "1": "DEL", "3": "DEL", "5": "COR"}
    try:
        op_type = purpose_operation_type_mapping[purpose]
    except KeyError as e:
        raise FLUXParsingError(f"Error finding operation type for code {purpose}: ", e)
    return op_type


def parse_metadata(fa_report_document: xml.etree.ElementTree.Element):
    metadata = {
        "operation_type": get_operation_type(fa_report_document),
        "report_id": get_text(fa_report_document, './/ram:ID[@schemeID="UUID"]'),
        "report_datetime_utc": make_datetime(
            get_text(fa_report_document, ".//ram:CreationDateTime/udt:DateTime")
        ),
        "trip_number": get_text(
            fa_report_document,
            './/ram:SpecifiedFishingTrip/ram:ID[@schemeID="EU_TRIP_ID"]',
        ),
        "referenced_report_id": get_text(
            fa_report_document, './/ram:ReferencedID[@schemeID="UUID"]'
        ),
    }

    vessel = get_element(fa_report_document, "ram:SpecifiedVesselTransportMeans")

    if vessel is not None:
        vessel_data = {
            "cfr": get_text(vessel, './/*[@schemeID="CFR"]'),
            "ircs": get_text(vessel, './/*[@schemeID="IRCS"]'),
            "external_identification": get_text(vessel, './/*[@schemeID="EXT_MARK"]'),
            "vessel_name": get_text(vessel, "ram:Name"),
            "flag_state": get_text(vessel, './/ram:ID[@schemeID="TERRITORY"]'),
            "imo": get_text(vessel, './/*[@schemeID="UVI"]'),
        }
        metadata = {**metadata, **vessel_data}

    return metadata


def parse_fa_report_document(fa_report_document: ET.Element):
    metadata = parse_metadata(fa_report_document)

    report_type = get_fa_report_type(fa_report_document)

    children = tagged_children(fa_report_document)

    activity_datetimes_utc = []
    if "SpecifiedFishingActivity" in children:
        log_types = set()
        values = []
        for specified_fishing_activity in children["SpecifiedFishingActivity"]:
            log_type, activity_datetime_utc, value = parse_specified_fishing_activity(
                specified_fishing_activity, report_type
            )
            log_types.add(log_type)
            values.append(value)
            if isinstance(activity_datetime_utc, datetime):
                activity_datetimes_utc.append(activity_datetime_utc)
        try:
            assert len(log_types) == 1
        except AssertionError:
            raise FLUXParsingError(
                (
                    "A FluxFAReportDocument cannot hold SpecifiedFishingActivity "
                    "elements of different types"
                )
            )
        data = {"log_type": log_types.pop(), "value": values}
        if data["log_type"] == "FAR":
            data["value"] = {"hauls": data["value"]}
        else:
            assert len(children["SpecifiedFishingActivity"]) == 1
            data["value"] = data["value"][0]
    else:
        data = dict()

    if activity_datetimes_utc:
        activity_datetime_utc = min(activity_datetimes_utc)
    else:
        activity_datetime_utc = None

    fa_report_document_data = {
        "activity_datetime_utc": activity_datetime_utc,
        **metadata,
        **data,
    }

    return fa_report_document_data


specified_fishing_activity_parsers = {
    "DEP": parse_dep,
    "FAR": parse_far,
    "DIS": parse_dis,
    "RTP": parse_rtp,
    "LAN": parse_lan,
    "RLC": null_parser,
    "TRA": null_parser,
    "COE": parse_coe,
    "COX": parse_cox,
    "PNO": parse_pno,
    "NOT-TRA": null_parser,
    "NOT-COE": parse_coe,
    "NOT-COX": parse_cox,
    "JFO": null_parser,
    "GEAR_SHOT": null_parser,
    "GEAR_RETRIEVAL": null_parser,
    "START_ACTIVITY": null_parser,
    "START_FISHING": null_parser,
}


def parse_specified_fishing_activity(
    fishing_activity: ET.Element, report_type: FluxFAReportDocumentType
):
    log_type = get_log_type(fishing_activity, report_type)
    try:
        parser = specified_fishing_activity_parsers[log_type]
    except KeyError as e:
        logging.warning(f"Parser not implemented for xml tag: {log_type}")
        raise FLUXParsingError(
            f"Could not find appropriate parser for log type {log_type}: ", e
        )
    value = parser(fishing_activity)

    datetime_string = get_text(
        fishing_activity, ".//ram:OccurrenceDateTime/udt:DateTime"
    )
    if not datetime_string:
        datetime_string = get_text(
            fishing_activity,
            "./ram:SpecifiedDelimitedPeriod/ram:EndDateTime/udt:DateTime",
        )

    if datetime_string:
        try:
            activity_datetime_utc = parse(datetime_string).replace(tzinfo=None)
        except Exception as e:
            logging.error(
                f"Cound not parse datetime string {datetime_string} with error: {e}"
            )
            activity_datetime_utc = None
    else:
        activity_datetime_utc = None

    return log_type, activity_datetime_utc, value


def get_list_fa_report_documents(fa_report_message: ET.Element) -> List[ET.Element]:
    fa_report_documents = fa_report_message.findall("FAReportDocument", NS_FLUX)
    return fa_report_documents


def base64_decode(fa_report_message_string: str) -> str:
    """Takes a string that represents the content of an xml message of the FLUX format
    that may be base64-encoded and wrapped in an outer `BASE64DATA` xml tag (or not),
    and returns the decoded message. If the input message is not base64-encoded, simply
    return the unmodified input.

    Args:
        fa_report_message_string (str): FLUX message string, possibly base64-encoded
          and wrapped in a `BASE64DATA` xml tag.

    Raises:
        FLUXParsingError: `FLUXParsingError` if the input string is not valid xml or
          its root tag is unexpected.

    Returns:
        str: decoded FLUX message, ready for parsing and data extraction
    """
    try:
        fa_report_message = ET.fromstring(fa_report_message_string)
    except ParseError:
        raise FLUXParsingError(
            f"Could not parse FLUX xml document: {fa_report_message_string[:40]}[...]"
        )

    fa_report_message_tag = get_root_tag(fa_report_message)
    if fa_report_message_tag == "BASE64DATA":
        decoded_flux_xml_string = gzip.decompress(
            base64.b64decode(fa_report_message.text)
        ).decode("utf-8")
    elif fa_report_message_tag == "FLUXFAReportMessage":
        decoded_flux_xml_string = fa_report_message_string
    else:
        raise FLUXParsingError(
            f"fa_report_message element has an unexpected root tag {fa_report_message_tag}"
        )
    return decoded_flux_xml_string


def parse_fa_report_message_string(
    fa_report_message_string: str,
) -> Tuple[str, List[dict]]:
    try:
        fa_report_message = ET.fromstring(fa_report_message_string)
    except ParseError as e:
        raise FLUXParsingError("Could not parse xml string: ", e)

    operation_number = get_text(
        fa_report_message, './/rsm:FLUXReportDocument/ram:ID[@schemeID="UUID"]'
    )

    operation_data = {
        "operation_number": operation_number,
        "operation_datetime_utc": make_datetime(
            get_text(
                fa_report_message,
                ".//rsm:FLUXReportDocument/ram:CreationDateTime/udt:DateTime",
            )
        ),
    }
    fa_report_documents = get_list_fa_report_documents(fa_report_message)
    fa_report_message_data = []
    for fa_report_document in fa_report_documents:
        try:
            fa_report_document_data = parse_fa_report_document(fa_report_document)
        except FLUXParsingError:
            logging.error("Could not parse one report. This report will be skipped.")
            continue
        fa_report_message_data.append({**operation_data, **fa_report_document_data})
    return operation_number, fa_report_message_data


def batch_parse(fa_report_message_strings: List[str]) -> dict:
    """Parses a list of FLUX messages and returns a dictionnary with the information
    extracted from the messages.

    Args:
        flux_fa_report_message_strings (List[str]): list of FLUX xml documents, some of
          which may be BASE64 encoded

    Returns:
        dict : dictionnary with 3 elemements:

          - logbook_reports pd.DataFrame: Dataframe with parsed data
          - logbook_raw_messages (pd.DataFrame):  Dataframe with the original xml
            messages
          - batch_generated_errors (boolean): `True` if an error occurred during the
            treatment of one or more of the messages
    """
    logbook_reports_list = []
    logbook_raw_messages_list = []
    batch_generated_errors = False

    reports_defaults = {
        "operation_number": None,
        "operation_datetime_utc": None,
        "operation_type": None,
        "report_id": None,
        "referenced_report_id": None,
        "report_datetime_utc": None,
        "cfr": None,
        "ircs": None,
        "external_identification": None,
        "vessel_name": None,
        "flag_state": None,
        "imo": None,
        "log_type": None,
        "value": None,
        "integration_datetime_utc": None,
    }

    for fa_report_message_string in fa_report_message_strings:
        try:
            fa_report_message_string = base64_decode(fa_report_message_string)
        except FLUXParsingError:
            log_end = "..." if len(fa_report_message_string) > 40 else ""
            logging.error(
                f"Could not BASE64 decode message {fa_report_message_string[:40]}{log_end}"
            )
            batch_generated_errors = True
            continue

        try:
            operation_number, fa_report_message_data = parse_fa_report_message_string(
                fa_report_message_string
            )
        except FLUXParsingError:
            log_end = "..." if len(fa_report_message_string) > 40 else ""
            logging.error(
                (
                    "Could not parse report message "
                    f"{fa_report_message_string[:40]}{log_end}. "
                    "This message will be skipped."
                )
            )
            batch_generated_errors = True
            continue

        now = datetime.utcnow()
        raw = {
            "operation_number": operation_number,
            "xml_message": fa_report_message_string,
        }
        logbook_raw_messages_list.append(pd.Series(raw))

        for fa_report_document_data in fa_report_message_data:
            logbook_reports_list.append(
                pd.Series(
                    {
                        **reports_defaults,
                        **fa_report_document_data,
                        "integration_datetime_utc": now,
                    }
                )
            )

    logbook_reports = pd.DataFrame(columns=pd.Index(reports_defaults))
    logbook_raw_messages = pd.DataFrame(columns=pd.Index(raw))
    if len(logbook_reports_list) > 0:
        logbook_reports = (
            pd.concat(logbook_reports_list, axis=1)
            .T.sort_values("operation_datetime_utc")
            .drop_duplicates(subset=["report_id"])
        )
    if len(logbook_raw_messages_list) > 0:
        logbook_raw_messages = pd.concat(
            logbook_raw_messages_list, axis=1
        ).T.drop_duplicates(subset=["operation_number"])

    return {
        "logbook_reports": logbook_reports,
        "logbook_raw_messages": logbook_raw_messages,
        "batch_generated_errors": batch_generated_errors,
    }
