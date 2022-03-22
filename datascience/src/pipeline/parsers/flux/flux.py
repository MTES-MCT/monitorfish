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
    data_iter = []
    if "SpecifiedFishingActivity" in children:
        nb_FActivity = len(children["SpecifiedFishingActivity"])
        if nb_FActivity > 1:
            value = {"log_type": "FAR", "value": []}
            for child in children["SpecifiedFishingActivity"]:
                data = parse_message(child)
                value["value"].append(data.get("value")[0])
            data_iter.append(value)
        else:
            data = parse_message(get_element(el, "ram:SpecifiedFishingActivity"))
            data_iter.append(data)

    return metadata, data_iter


def parse_not(not_):
    op_type = get_purpose(not_)
    metadata = parse_metadata(not_, op_type)

    children = tagged_children(not_)
    data_iter = []
    if "SpecifiedFishingActivity" in children:
        for child in children["SpecifiedFishingActivity"]:
            msg_type = get_msg_type(child)
            if msg_type == "RTP":
                data = parse_pno(child)
                data_iter.append(data)
            else:
                data = {"log_type": "NOT-" + msg_type}
                data_iter.append(data)
    return metadata, data_iter


def parse_del(del_):
    metadata = {
        "operation_type": "DEL",
        "referenced_flux_id": get_text(del_, './/ram:ReferencedID[@schemeID="UUID"]'),
    }

    return metadata, [{"value": None}]


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
    try:
        res = parser(el)
    except:
        raise FLUXParsingError
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


def decode_flux(enc_flux):
    root = ET.fromstring(enc_flux).text
    dec_flux = gzip.decompress(base64.b64decode(root)).decode("utf-8")
    return dec_flux


def parse_xml_document(xml_document, decode_base64):
    try:
        if decode_base64:
            xml_document = decode_flux(xml_document)
        el = ET.fromstring(xml_document)
        op_data = {
            "operation_number": get_text(
                el, './/rsm:FLUXReportDocument/ram:ID[@schemeID="UUID"]'
            ),
            "operation_datetime_utc": make_datetime(
                get_text(
                    el, ".//rsm:FLUXReportDocument/ram:CreationDateTime/udt:DateTime"
                )
            ),
        }
        msg_list = get_list_flux_message(el)
        res = []
        for msg in msg_list:
            data, data_iter = parse_report(msg)
            metadata = {**op_data, **data}
            res.append([metadata, data_iter])
    except ParseError:
        raise FLUXParsingError
    return res


def batch_parse(xml_messages: List[str]) -> dict:
    """Parses a list of FLUX documents and returns a dictionnary with the information
    extracted from the messages.

    Args:
        xml_messages (List[str]): list of FLUX xml documents

    Returns:
          - logbook_reports pd.DataFrame: Dataframe with parsed metadata, including a "value" column
            with json data extracted with the xml message
          - logbook_raw_messages (pd.DataFrame):  Dataframe with parsed metadata, including a "xml_message" column
            with the original xml message
          - batch_generated_errors (boolean): `True` if an error occurred during the
            treatment of one or more of the messages
    """
    res_json = []
    res_xml = []
    batch_generated_errors = False

    res_json_default = {
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

    for xml_document in xml_messages:
        parsed_doc = parse_xml_document(xml_document, decode_base64=True)

        now = datetime.utcnow()
        raw = {
            "operation_number": parsed_doc[0][0].get("operation_number"),
            "xml_message": decode_flux(xml_document),
        }
        res_xml.append(pd.Series({**raw}))

        for res in parsed_doc:
            try:
                metadata = res[0]
                data = res[1][0]
                res_json.append(
                    pd.Series(
                        {
                            **res_json_default,
                            **metadata,
                            **data,
                            "integration_datetime_utc": now,
                        }
                    )
                )
            except FLUXParsingError:
                log_end = "..." if len(xml_document) > 40 else ""
                logging.error(
                    "Parsing error - one FLUX message will be ignored : "
                    + xml_document[:40]
                    + log_end
                )
                batch_generated_errors = True
            except:
                logging.error("Unkonwn error with message " + xml_document)
                batch_generated_errors = True

        parsed = pd.DataFrame(columns=pd.Index(res_json_default))
        parsed_with_xml = pd.DataFrame(columns=pd.Index(raw))
        if len(res_json) > 0:
            parsed = pd.concat(res_json, axis=1).T.drop_duplicates(subset=["report_id"])
        if len(res_xml) > 0:
            parsed_with_xml = pd.concat(res_xml, axis=1).T

    return {
        "parsed": parsed,
        "parsed_with_xml": parsed_with_xml,
        "batch_generated_errors": batch_generated_errors,
    }
