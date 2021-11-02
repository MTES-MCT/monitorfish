import logging
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

def remove_namespace(tag: str):
    """Removes xmlns from tag string.

    --------
    Examples

    >>> remove_namespace("{http://ec.europa.eu/fisheries/schema/ers/v3}OPS")
    "OPS"
    """
    return tag.split("}")[-1]

def get_element(xml_element, xml_path):
    return xml_element.find(xml_path, NS_FLUX)

def get_type(xml_element):
    #Renvoie le type d'operation (DAT, COR,...) ou le type de message(DEP, LAN,...)
    purpose = get_purpose(xml_element)
    report_type = get_element(xml_element,'.//ram:TypeCode[@listID="FLUX_FA_REPORT_TYPE"]')
    if purpose is None:
        type = get_text(xml_element,'.//*[@listID="FLUX_FA_TYPE"]')
    elif report_type.text=='NOTIFICATION':
        type = report_type.text 
    else :
        type = purpose
    return type

def get_purpose(xml_element):
    purpose = get_element(xml_element,'.//*[@listID="FLUX_GP_PURPOSE"]')
    if purpose is None:
        return None
    if purpose.text=='9' :
        op_type='DAT'
    elif purpose.text=='1' or purpose.text=='3':
        op_type='DEL'
    elif purpose.text=='5':
        op_type='COR'
    return op_type


def get_text(xml_element, xml_path):
    el = get_element(xml_element, xml_path)
    if el is None:
        return None
    else:
        return el.text        

def get_root_tag(xml_element):
    root_tag = remove_namespace(xml_element.tag)
    return root_tag

def make_datetime(date: str):
    try:
        res = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(microsecond=0)
    except ValueError:
        logging.warning("FLUX datetime could not be parsed")
        res = None
    return res


def try_float(s: str):
    try:
        return float(s)
    except:
        return None


def tagged_children(el):
    children = list(el)
    res = {}

    for child in children:
        tag = remove_namespace(child.tag)
        if tag in res:
            res[tag].append(child)
        else:
            res[tag] = [child]

    return res
