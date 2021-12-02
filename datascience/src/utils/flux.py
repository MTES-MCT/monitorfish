import logging
import types
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Union
from xml.etree.ElementTree import ParseError

NS_FLUX = {
    "" : "urn:un:unece:uncefact:data:standard:FLUXFAReportMessage:3",
    "qdt" : "urn:un:unece:uncefact:data:Standard:QualifiedDataType:20",
    "udt" : "urn:un:unece:uncefact:data:standard:UnqualifiedDataType:20",
    "cmtc" : "urn:un:unece:uncefact:codelist:standard:UNECE:CommunicationMeansTypeCode:D16A",
    "ram" : "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:20",
    "rsm" : "urn:un:unece:uncefact:data:standard:FLUXFAReportMessage:3",
    "flux" : "urn:xeu:flux-transport:v1"}

def get_element(xml_element, xml_path):
    return xml_element.find(xml_path, NS_FLUX)

msg_types = {
    "DEPARTURE": "DEP",
    "FISHING_OPERATION": "FAR",
    "DISCARD": "DIS",
    "ARRIVAL": "RTP",
    "LANDING": "LAN",
    "RELOCATION": "RLC",
    "TRANSHIPMENT": "TRA",
    "AREA_ENTRY": "COE",
    "AREA_EXIT": "COX",
    "JOINT_FISHING_OPERATION": "JOINT_FISHING_OPERATION",
}

def get_msg_type(xml_element):
    #Renvoie le type de message(DEP, LAN,...)
    message_type = get_text(xml_element,'.//ram:TypeCode[@listID="FLUX_FA_TYPE"]')
    try:
        type = msg_types[message_type] 
    except:
        type=message_type
    return type

def get_op_type(xml_element):
    #Renvoie le type d'operation (DAT, COR, DEL ou NOTIFICATION)
    report_type = get_text(xml_element,'.//ram:TypeCode[@listID="FLUX_FA_REPORT_TYPE"]')
    if report_type=='NOTIFICATION':
        return 'NOT'
    else :
        return get_purpose(xml_element)

def get_purpose(xml_element):
    purpose = get_text(xml_element,'.//*[@listID="FLUX_GP_PURPOSE"]')
    purpose_list={'9':'DAT','1':'DEL','3':'DEL','5':'COR'}
    try:
        op_type=purpose_list[purpose]
    except KeyError:
        logging.warning('Parser not implemented for purpose code: ' + purpose)
        raise Exception
    return op_type


def get_text(xml_element, xml_path):
    el = get_element(xml_element, xml_path)
    if el is None:
        return None
    else:
        return el.text        

def make_datetime(date: str):
    try:
        res = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(microsecond=0)
    except :
        try:
            res = datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            logging.warning("FLUX datetime could not be parsed")
            res = None
    return res

def remove_none_values(d: dict) -> dict:
    return {key: d[key] for key in d if d[key] is not None}
