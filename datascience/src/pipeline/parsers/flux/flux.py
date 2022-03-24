import base64
import gzip
import logging
import xml
import xml.etree.ElementTree as ET
from datetime import datetime
from functools import partial
from typing import List
from xml.etree.ElementTree import ParseError

import pandas as pd

from src.pipeline.parsers.flux.log_parsers import (
    default_log_parser,
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
    get_msg_type,
    get_op_type,
    get_purpose,
    get_text,
    make_datetime,
)
from src.pipeline.parsers.utils import tagged_children


class FLUXParsingError(Exception):
    """Raised when an FLUX message cannot be parsed."""


def parse_metadata(el: xml.etree.ElementTree.Element, op_type):
    vessel = get_element(el, "ram:SpecifiedVesselTransportMeans")

    metadata = {
        "operation_type": op_type,
        "report_id": get_text(el, './/ram:ID[@schemeID="UUID"]'),
        "report_datetime_utc": make_datetime(
            get_text(el, ".//ram:CreationDateTime/udt:DateTime")
        ),
        "cfr": get_text(vessel, './/*[@schemeID="CFR"]'),
        "ircs": get_text(vessel, './/*[@schemeID="IRCS"]'),
        "external_identification": get_text(vessel, './/*[@schemeID="EXT_MARK"]'),
        "vessel_name": get_text(vessel, "ram:Name"),
        "flag_state": get_text(vessel, './/ram:ID[@schemeID="TERRITORY"]'),
        "imo": get_text(vessel, './/*[@schemeID="UVI"]'),
        "trip_number": get_text(
            el, './/ram:SpecifiedFishingTrip/ram:ID[@schemeID="EU_TRIP_ID"]'
        ),
    }
    if op_type == "COR":
        metadata = {
            **metadata,
            "referenced_report_id": get_text(
                el, './/ram:ReferencedID[@schemeID="UUID"]'
            ),
        }

    return metadata


def simple_parser(el: xml.etree.ElementTree.Element, op_type):
    metadata = parse_metadata(el, op_type)

    children = tagged_children(el)
    data = None
    if "SpecifiedFishingActivity" in children:
        log_types = set()
        values = []
        for child in children["SpecifiedFishingActivity"]:
            fishing_activity_data = parse_message(child)
            log_types.add(fishing_activity_data["log_type"])
            values.append(fishing_activity_data.get("value"))
        assert len(log_types) == 1
        data = {"log_type": log_types.pop(), "value": values}
        if data["log_type"] != "FAR":
            data["value"] = data["value"][0]

    return metadata, data


def parse_not(not_):
    op_type = get_purpose(not_)
    metadata = parse_metadata(not_, op_type)

    children = tagged_children(not_)
    if "SpecifiedFishingActivity" in children:
        for child in children["SpecifiedFishingActivity"]:
            msg_type = get_msg_type(child)
            if msg_type == "RTP":
                data = parse_pno(child)
            else:
                data = {"log_type": "NOT-" + msg_type}
    return metadata, data


def parse_del(del_):
    metadata = {
        "operation_type": "DEL",
        "referenced_flux_id": get_text(del_, './/ram:ReferencedID[@schemeID="UUID"]'),
    }

    return metadata, {"value": None}


parsers = {
    "DAT": partial(simple_parser, op_type="DAT"),
    "COR": partial(simple_parser, op_type="COR"),
    "DEL": parse_del,
    "DEP": parse_dep,
    "FAR": parse_far,
    "DIS": parse_dis,
    "NOT": parse_not,
    "RTP": parse_rtp,
    "LAN": parse_lan,
    "RLC": default_log_parser,
    "TRA": default_log_parser,
    "COE": parse_coe,
    "COX": parse_cox,
    "JOINT_FISHING_OPERATION": default_log_parser,
}


def parse(el, tag):
    try:
        parser = parsers[tag]
    except KeyError:
        logging.warning(f"Parser not implemented for xml tag: {tag}")
        raise FLUXParsingError
    res = parser(el)
    return res


def parse_report(el):
    op_type = get_op_type(el)
    res = parse(el, op_type)
    return res


def parse_message(el):
    msg_type = get_msg_type(el)
    res = parse(el, msg_type)
    return res


def get_list_flux_message(xml_document):
    msg_list = xml_document.findall("FAReportDocument", NS_FLUX)
    return msg_list


def decode_flux(flux_xml_string: str) -> str:
    """Takes a string that represents the content of an xml message of the FLUX format
    that may be base64-encoded and wrapped in an outer `BASE64DATA` xml tag (or not),
    and returns the decoded message. If the input message is not base64-encoded, simply
    return the unmodified input.

    Args:
        flux_xml_string (str): FLUX message string, possibly base64-encoded and wrapped
          in a `BASE64DATA` xml tag.

    Raises:
        FLUXParsingError: `FLUXParsingError` if the input string is not valid xml

    Returns:
        str: decoded FLUX message, ready for parsing and data extraction
    """
    try:
        el = ET.fromstring(flux_xml_string)
    except ParseError:
        raise FLUXParsingError(
            "Could not parse FLUX xml document: {flux_xml_string[:40]}[...]"
        )
    if el.tag == "BASE64DATA":
        decoded_flux_xml_string = gzip.decompress(base64.b64decode(el.text)).decode(
            "utf-8"
        )
    else:
        decoded_flux_xml_string = flux_xml_string
    return decoded_flux_xml_string


def parse_xml_document(xml_document: str):
    xml_document = decode_flux(xml_document)
    try:
        el = ET.fromstring(xml_document)
    except ParseError:
        raise FLUXParsingError

    op_data = {
        "operation_number": get_text(
            el, './/rsm:FLUXReportDocument/ram:ID[@schemeID="UUID"]'
        ),
        "operation_datetime_utc": make_datetime(
            get_text(el, ".//rsm:FLUXReportDocument/ram:CreationDateTime/udt:DateTime")
        ),
    }
    msg_list = get_list_flux_message(el)
    res = []
    for msg in msg_list:
        data, data_iter = parse_report(msg)
        metadata = {**op_data, **data}
        res.append([metadata, data_iter])
    return res


def batch_parse(xml_messages: List[str]) -> dict:
    """Parses a list of FLUX documents and returns a dictionnary with the information
    extracted from the messages.

    Args:
        xml_messages (List[str]): list of FLUX xml documents

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

    for xml_message in xml_messages:
        parsed_doc = parse_xml_document(xml_message)

        now = datetime.utcnow()
        raw = {
            "operation_number": parsed_doc[0][0].get("operation_number"),
            "xml_message": decode_flux(xml_message),
        }
        logbook_raw_messages_list.append(pd.Series(raw))

        for res in parsed_doc:
            try:
                metadata = res[0]
                data = res[1]
                logbook_reports_list.append(
                    pd.Series(
                        {
                            **reports_defaults,
                            **metadata,
                            **data,
                            "integration_datetime_utc": now,
                        }
                    )
                )
            except FLUXParsingError:
                log_end = "..." if len(xml_message) > 40 else ""
                logging.error(
                    "Parsing error - one FLUX message will be ignored : "
                    + xml_message[:40]
                    + log_end
                )
                batch_generated_errors = True
            except:
                logging.error("Unkonwn error with message " + xml_message)
                batch_generated_errors = True

        logbook_reports = pd.DataFrame(columns=pd.Index(reports_defaults))
        logbook_raw_messages = pd.DataFrame(columns=pd.Index(raw))
        if len(logbook_reports_list) > 0:
            logbook_reports = pd.concat(logbook_reports_list, axis=1).T.drop_duplicates(
                subset=["report_id"]
            )
        if len(logbook_raw_messages_list) > 0:
            logbook_raw_messages = pd.concat(logbook_raw_messages_list, axis=1).T

    return {
        "logbook_reports": logbook_reports,
        "logbook_raw_messages": logbook_raw_messages,
        "batch_generated_errors": batch_generated_errors,
    }
