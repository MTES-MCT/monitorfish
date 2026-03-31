import logging
from datetime import datetime, timezone
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


def make_datetime(date: str, time: Union[str, None] = None) -> datetime:
    """Takes date a "2020-12-24" string and, optionnally, a time "16:49" or "16:49:10"
    string. Returns a datetime object"""
    datetime_string = date

    if date:
        if time:
            datetime_string += f"T{time}"
        try:
            res = datetime.fromisoformat(datetime_string)
            if res.tzinfo is not None:
                res = res.astimezone(timezone.utc).replace(tzinfo=None)
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
