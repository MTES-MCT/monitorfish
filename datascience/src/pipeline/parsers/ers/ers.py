import logging
import xml
import xml.etree.ElementTree as ET
from datetime import datetime
from functools import partial
from typing import List
from xml.etree.ElementTree import ParseError

import pandas as pd

from src.pipeline.parsers.ers.log_parsers import (
    default_log_parser,
    parse_coe,
    parse_cox,
    parse_cro,
    parse_dep,
    parse_dis,
    parse_ecps,
    parse_eof,
    parse_far,
    parse_lan,
    parse_pno,
    parse_rtp,
)
from src.pipeline.parsers.utils import (
    get_first_child,
    get_root_tag,
    make_datetime,
    remove_namespace,
)


class ERSParsingError(Exception):
    """Raised when an ERS message cannot be parsed."""


def simple_parser(el: xml.etree.ElementTree.Element, pass_child: bool = False):
    root_tag = get_root_tag(el)
    metadata = {"operation_type": root_tag}

    if pass_child:
        child = get_first_child(el, assert_child_single=True)
    else:
        child = None

    data = None
    logs = None
    return metadata, child, logs, data


def parse_ops(ops):
    ops_date = ops.get("OD")
    ops_time = ops.get("OT")
    is_test_message = ops.get("TS") == "1"

    ops_datetime = make_datetime(ops_date, ops_time)

    metadata = {
        "operation_number": ops.get("ON"),
        "operation_country": ops.get("FR"),
        "operation_datetime_utc": ops_datetime,
        "software": ops.get("EVL"),
        "is_test_message": is_test_message,
    }

    child = get_first_child(list(ops), assert_child_single=True)

    return metadata, child, None, None


def parse_cor(cor):
    metadata = {"operation_type": "COR", "referenced_report_id": cor.get("RN")}
    child = get_first_child(cor, assert_child_single=True)
    return metadata, child, None, None


def parse_del(del_):
    metadata = {"operation_type": "DEL", "referenced_report_id": del_.get("RN")}

    return metadata, None, None, {"value": None}


def parse_ret(ret):
    metadata = {"operation_type": "RET", "referenced_report_id": ret.get("ON")}

    data = {
        "returnStatus": ret.get("RS"),
    }

    rejection_cause = ret.get("RE")

    if rejection_cause:
        data["rejectionCause"] = rejection_cause

    return metadata, None, None, {"value": data}


def parse_ers(ers):
    ers_date = ers.get("RD")
    ers_time = ers.get("RT")

    ers_datetime = make_datetime(ers_date, ers_time)

    metadata = {"report_id": ers.get("RN"), "report_datetime_utc": ers_datetime}

    children = list(ers)
    child = get_first_child(
        children,
    )

    return metadata, child, None, None


def parse_log(log):
    logs = [child for child in list(log) if remove_namespace(child.tag) != "ELOG"]

    metadata = {
        "cfr": log.get("IR"),
        "ircs": log.get("RC"),
        "external_identification": log.get("XR"),
        "vessel_name": log.get("NA"),
        "flag_state": log.get("FS"),
        "imo": log.get("IM"),
    }

    elogs = [child for child in list(log) if remove_namespace(child.tag) == "ELOG"]
    if len(elogs) >= 1:
        elog = elogs[0]
        metadata["trip_number"] = elog.get("TN")
        ecps = [
            el for elog in elogs for el in elog if remove_namespace(el.tag) == "ECPS"
        ]
        logs += ecps

    return metadata, None, logs, None


parsers = {
    "DAT": partial(simple_parser, pass_child=True),
    "COR": parse_cor,
    "DEL": parse_del,
    "RET": parse_ret,
    "QUE": partial(simple_parser, pass_child=False),
    "RSP": partial(simple_parser, pass_child=False),
    "OPS": parse_ops,
    "ERS": parse_ers,
    "LOG": parse_log,
    "DEP": parse_dep,
    "FAR": parse_far,
    "ECPS": parse_ecps,
    "DIS": parse_dis,
    "EOF": parse_eof,
    "PNO": parse_pno,
    "RTP": parse_rtp,
    "LAN": parse_lan,
    "RLC": default_log_parser,
    "TRA": default_log_parser,
    "COE": parse_coe,
    "COX": parse_cox,
    "CRO": parse_cro,
    "TRZ": default_log_parser,
    "INS": default_log_parser,
    "PNT": default_log_parser,
}


def parse_(el):
    root_tag = get_root_tag(el)
    try:
        parser = parsers[root_tag]
    except KeyError:
        logging.warning(f"Parser not implemented for xml tag: {root_tag}")
        raise ERSParsingError
    try:
        res = parser(el)
    except:
        raise ERSParsingError
    return res


def parse(el):
    metadata, child, logs, data = parse_(el)

    # OPS, DAT, COR and ERS elements with metadata and a child element to parse
    if metadata is not None and child is not None and logs is None and data is None:
        child_metadata, data_iter = parse(child)
        return {**metadata, **child_metadata}, data_iter

    # LOG elements with FAR, LAN, PNO... children
    elif metadata is not None and child is None and logs is not None and data is None:
        return metadata, map(parse_, logs)

    # DEL, RET elements with no child, no logs
    elif metadata is not None and child is None and logs is None and data is not None:
        return metadata, iter([data])

    # RSP, QUE elements with only metadata
    elif metadata is not None and child is None and logs is None and data is None:
        return metadata, iter([])

    else:
        raise ERSParsingError


def parse_xml_string(xml_string):
    try:
        el = ET.fromstring(xml_string.strip("¿"))
    except ParseError:
        raise ERSParsingError
    return parse(el)


def batch_parse(xml_messages: List[str]) -> dict:
    """Parses a list of ERS messages and returns a dictionnary with the information
    extracted from the messages.

    Args:
        xml_messages (List[str]): list of ERS xml messages

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

    raw_messages_columns = [
        "operation_number",
        "xml_message",
    ]

    reports_defaults = {
        "operation_number": None,
        "operation_country": None,
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
        try:
            metadata, data_iterator = parse_xml_string(xml_message)
            now = datetime.utcnow()
            raw = {
                "operation_number": metadata.get("operation_number"),
                "xml_message": xml_message,
            }
            for data in data_iterator:
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
            logbook_raw_messages_list.append(pd.Series(raw))
        except ERSParsingError:
            log_end = "..." if len(xml_message) > 40 else ""
            logging.error(
                "Parsing error - one ERS message will be ignored : "
                + xml_message[:40]
                + log_end
            )
            batch_generated_errors = True
        except:
            logging.error("Unkonwn error with message " + xml_message)
            batch_generated_errors = True

    logbook_reports = pd.DataFrame(columns=pd.Index(reports_defaults))
    logbook_raw_messages = pd.DataFrame(columns=pd.Index(raw_messages_columns))
    if len(logbook_reports_list) > 0:
        logbook_reports = pd.concat(logbook_reports_list, axis=1).T
    if len(logbook_raw_messages_list) > 0:
        logbook_raw_messages = pd.concat(logbook_raw_messages_list, axis=1).T

    return {
        "logbook_reports": logbook_reports,
        "logbook_raw_messages": logbook_raw_messages,
        "batch_generated_errors": batch_generated_errors,
    }
