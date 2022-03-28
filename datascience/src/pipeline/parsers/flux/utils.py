import logging
import xml.etree.ElementTree as ET
from datetime import datetime

NS_FLUX = {
    "": "urn:un:unece:uncefact:data:standard:FLUXFAReportMessage:3",
    "qdt": "urn:un:unece:uncefact:data:Standard:QualifiedDataType:20",
    "udt": "urn:un:unece:uncefact:data:standard:UnqualifiedDataType:20",
    "cmtc": "urn:un:unece:uncefact:codelist:standard:UNECE:CommunicationMeansTypeCode:D16A",
    "ram": "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:20",
    "rsm": "urn:un:unece:uncefact:data:standard:FLUXFAReportMessage:3",
    "flux": "urn:xeu:flux-transport:v1",
}


def get_element(xml_element: ET.Element, xml_path: str) -> ET.Element:
    """Returns the first element of `xml_element` that matches the provided `xml_path`.

    Args:
        xml_element (ET.Element): xml element in which to search
        xml_path (str): path describing the searched element

    Returns:
        ET.Element: first element of the input `xml_element` that matches `xml_path`
    """
    return xml_element.find(xml_path, NS_FLUX)


def get_text(xml_element, xml_path):
    el = get_element(xml_element, xml_path)
    if el is None:
        return None
    else:
        return el.text


def make_datetime(date: str):
    try:
        res = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(microsecond=0)
    except:
        try:
            res = datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            logging.warning("FLUX datetime could not be parsed")
            res = None
    return res


def remove_none_values(d: dict) -> dict:
    return {key: d[key] for key in d if d[key] is not None}
