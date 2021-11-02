import logging
import xml
import xml.etree.ElementTree as ET
import gzip
import base64
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

from src.utils.flux import NS_FLUX, get_element, get_type, get_purpose, get_text, make_datetime

class FLUXParsingError(Exception):
    """Raised when an FLUX message cannot be parsed."""

    pass

def simple_parser(el: xml.etree.ElementTree.Element, op_type, pass_child: bool = False):
    vessel = get_element(el,'ram:SpecifiedVesselTransportMeans')

    data =  {"operation_type": op_type,
            "operation_datetime_utc": make_datetime(get_text(el,'.//ram:CreationDateTime/udt:DateTime')),
            "flux_id": get_text(el,'.//ram:ID[@schemeID="UUID"]'),
            "flux_datetime_utc": make_datetime(get_text(el,'.//ram:AcceptanceDateTime/udt:DateTime')),
            "cfr": get_text(vessel,'.//*[@schemeID="CFR"]'),
            "ircs": get_text(vessel,'.//*[@schemeID="IRCS"]'),
            "external_identification": get_text(vessel,'.//*[@schemeID="EXT_MARK"]'),
            "vessel_name": get_text(vessel,'ram:Name'),
            "flag_state": get_text(vessel,'.//ram:ID[@schemeID="TERRITORY"]'),
            "imo": get_text(vessel,'.//*[@schemeID="UVI"]'),
            "trip_number": get_text(el,'.//ram:ID[@schemeID="EU_TRIP_ID"]')
            }

    if pass_child:
        child = get_element(el,'ram:SpecifiedFishingActivity')
    else:
        child = None

    if op_type=='DAT':
        metadata=data
    if op_type=='COR':
        metadata= {**data, "referenced_flux_id": get_text(el,'.//ram:ReferencedID[@schemeID="UUID"]')}

    return metadata, child, None

def parse_not(not_):
    op_type = get_purpose(not_)
    metadata, child, tmp_data = simple_parser(not_, op_type, False)
    pno = get_element(not_,'ram:SpecifiedFishingActivity')
    msg_type = get_type(pno)
    if msg_type=='ARRIVAL' :
        data = parse_pno(pno)
    else :
        data = {"log_type": "PNO-"+msg_type}
    return metadata, child, data

def parse_del(del_):
    metadata = {"operation_type": "DEL", "referenced_flux_id": get_text(del_,'.//ram:ReferencedID[@schemeID="UUID"]')}

    return metadata, None, None

parsers = {
    "DAT": partial(simple_parser, op_type="DAT", pass_child=True),
    "COR": partial(simple_parser, op_type="COR", pass_child=True),
    "DEL": parse_del,
    "DEPARTURE": parse_dep,
    "FISHING_OPERATION": parse_far,
    "DISCARD": parse_dis,
    "NOTIFICATION": parse_not,
    "ARRIVAL": parse_rtp,
    "LANDING": parse_lan,
    "RELOCATION": default_log_parser,
    "TRANSHIPMENT": default_log_parser,
    "AREA_ENTRY": parse_coe,
    "AREA_EXIT": parse_cox,
    "JOINT_FISHING_OPERATION": default_log_parser,
}

def parse_(el):
    root_tag = get_type(el)
    try:
        parser = parsers[root_tag]
    except KeyError:
        logging.warning(f"Parser not implemented for xml tag: {root_tag}")
        raise FLUXParsingError
    try:
        res = parser(el)
    except:
        raise FLUXParsingError
    return res


def parse(el):
    metadata, child, data = parse_(el)

    # DAT and COR elements with metadata and a child element to parse
    if metadata is not None and child is not None and data is None :
        data_iter = parse_(child) 
        return metadata, iter([data_iter])

    # DEL elements
    elif metadata is not None and child is None and data is None :
        #print("parse 2")
        return metadata, iter([{"value": None}])

    # PNO elements
    elif metadata is not None and child is None and data is not None :
        return metadata, iter([data])

    else:
        raise FLUXParsingError

def get_list_flux_message(xml_document):
    msg_list=xml_document.findall('FAReportDocument',NS_FLUX)
    return msg_list

def decode_flux(enc_flux):
    root = ET.fromstring(enc_flux).text
    dec_flux = gzip.decompress(base64.b64decode(root)).decode("utf-8")
    return dec_flux

def parse_xml_document(xml_document):
    try:
        el = ET.fromstring(xml_document)
        metadata = {"operation_number": get_text(el,'.//rsm:FLUXReportDocument/ram:ID[@schemeID="UUID"]')}
        msg_list = get_list_flux_message(el)
        res = []
        for msg in msg_list:
            data, data_iter = parse(msg)
            metadata = {**metadata, **data}
            res.append([metadata, data_iter])
    except ParseError:
        raise FLUXParsingError
    return res

def batch_parse(flux_xmls: List[str]):
    """Parses FLUX documents and return 2 tables as DataFrames containing the
    information extracted from the documents.

    Args:
        flux_xmls (List[str]): list of flux xml documents

    Returns:
        pd.DataFrame: Dataframe with parsed metadata, including a "value" column
            with json data extracted with the xml message
        pd.DataFrame:  Dataframe with "xml_message" and  "operation_number" (document ID) columns
            with the original xml message
    """
    res_json = []
    res_xml = []
    batch_generated_errors = False

    res_xml_default = {
        "operation_number": None,
        "xml_message": None,
    }

    res_json_default = {
        "operation_number": None,
        "operation_datetime_utc": None,
        "operation_type": None,
        "flux_id": None,
        "referenced_flux_id": None,
        "flux_datetime_utc": None,
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

    for xml_document in flux_xmls:
        parsed_doc = parse_xml_document(xml_document)
        #print(parsed_doc)

        now = datetime.utcnow()
        raw = {
                    "operation_number":parsed_doc[0][0].get("operation_number"),
                    "xml_message": xml_document.replace('\n',''),
        }
        res_xml.append(pd.Series({**res_xml_default, **raw}))
        for res in parsed_doc:
            try:
                metadata=res[0]
                data_iterator = res[1]
                
                for data in data_iterator:
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
        parsed_with_xml = pd.DataFrame(columns=pd.Index(res_xml_default))
        if len(res_json) > 0:
            parsed = pd.concat(res_json, axis=1).T
        if len(res_xml) > 0:
            parsed_with_xml = pd.concat(res_xml, axis=1).T

    return {
        "parsed": parsed,
        "parsed_with_xml": parsed_with_xml,
        "batch_generated_errors": batch_generated_errors,
    }
