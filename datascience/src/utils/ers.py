import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Union
from xml.etree.ElementTree import ParseError

NS = {"ers": "http://ec.europa.eu/fisheries/schema/ers/v3"}


def remove_namespace(tag: str):
    """Removes xmlns from tag string.

    --------
    Examples

    >>> remove_namespace("{http://ec.europa.eu/fisheries/schema/ers/v3}OPS")
    "OPS"
    """
    return tag.split("}")[-1]


def xml_tag_structure_func_factory(max_depth, max_nb_children):
    def get_xml_tag_structure(
        xml_element, max_depth=max_depth, max_nb_children=max_nb_children
    ):
        children = xml_element.getchildren()
        tag = remove_namespace(xml_element.tag)

        if children == [] or max_depth == 1:
            return tag
        else:
            if max_nb_children:
                children = children[:max_nb_children]

            if max_depth:
                max_depth -= 1

            children_tag_structures = [
                get_xml_tag_structure(
                    child, max_depth=max_depth, max_nb_children=max_nb_children
                )
                for child in children
            ]

            if len(children) == 1:
                children_tag_structures = children_tag_structures[0]

            return {tag: children_tag_structures}

    def get_xml_string_tag_structure(xml_string):
        try:
            xml_element = ET.fromstring(xml_string)
        except ParseError:
            return None
        return get_xml_tag_structure(xml_element, max_depth, max_nb_children)

    return get_xml_string_tag_structure


def has_tag(tag):
    def has_tag_(xml_element):
        elements = xml_element.findall(f".//ers:{tag}", NS)
        if elements == []:
            return False
        else:
            return True

    return has_tag_


def get_elements_by_ers_tag(xml_element, ers_tag):
    return xml_element.findall(f".//ers:{ers_tag}", NS)


def get_root_tag(xml_element):
    root_tag = remove_namespace(xml_element.tag)
    return root_tag


def get_first_child(xml_element, assert_child_single=True):
    children = list(xml_element)

    if assert_child_single:
        assert len(children) == 1

    return children[0]


def make_datetime(date: str, time: Union[str, None] = None):
    """Takes date a "2020-12-24" string and, optionnally, a time "16:49" string,
    Returns a datetime object"""
    datetime_string = date
    datetime_format = "%Y-%m-%d"

    if date:
        if time:
            datetime_string += f" {time}"
            datetime_format += " %H:%M"
        try:
            res = datetime.strptime(datetime_string, datetime_format)
        except ValueError:
            logging.warning("ERS datetime could not be parsed")
            res = None
    else:
        res = None

    return res


def make_datetime_json_serializable(date: str, time: Union[str, None] = None):
    dt = make_datetime(date, time)
    if dt:
        return dt.isoformat() + "Z"
    else:
        return None


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
