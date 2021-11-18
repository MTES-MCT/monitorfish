import xml.etree.ElementTree as ET

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