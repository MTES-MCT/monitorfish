import logging
from datetime import datetime
from typing import Optional, Union


def remove_namespace(tag: str):
    """Removes xmlns from tag string.

    --------
    Examples

    >>> remove_namespace("{http://ec.europa.eu/fisheries/schema/ers/v3}OPS")
    "OPS"
    """
    return tag.split("}")[-1]


def get_root_tag(xml_element):
    root_tag = remove_namespace(xml_element.tag)
    return root_tag


def try_float(s: str):
    try:
        return float(s)
    except:
        return None


def try_int(s: str):
    try:
        return int(s)
    except:
        return None


def get_first_child(xml_element, assert_child_single=True):
    children = list(xml_element)

    if assert_child_single:
        assert len(children) == 1

    return children[0]


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


def make_datetime(date: str, time: Union[str, None] = None):
    """Takes date a "2020-12-24" string and, optionnally, a time "16:49" or "16:49:10"
    string. Returns a datetime object"""
    datetime_string = date
    datetime_format = "%Y-%m-%d"

    if date:
        if time:
            if len(time) == 8:
                # Drop seconds
                time = time[:5]
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


def serialize_datetime(dt: Optional[datetime] = None) -> str:
    """Serialize a datetime object

    Args:
        dt (Optional[datetime])

    Returns:
        str: Serialized datetime in ISO format.
    """
    if dt:
        return dt.isoformat() + "Z"
    else:
        return None
