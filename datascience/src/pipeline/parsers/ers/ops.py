from collections import Counter
from datetime import datetime
from functools import partial
import logging
import xml
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import ParseError

from src.utils.ers import remove_namespace


def get_root_tag(xml_element, assert_tag=None):
    root_tag = remove_namespace(xml_element.tag)
    
    if assert_tag:
        try:
            assert(root_tag == assert_tag)
        except AssertionError:
            raise ValueError(f"XML element {root_tag} is not of type {assert_tag}.")
        
    return root_tag


def get_first_child(xml_element, assert_child_single=True, assert_child_tag=None):
    children = xml_element.getchildren()
    
    if assert_child_single:
        assert len(children) == 1
        
    first_child = children[0]
    first_child_tag = remove_namespace(first_child.tag)
    
    if assert_child_tag:
        assert(first_child_tag == assert_child_tag)
        
    return first_child, first_child_tag


def parse_ops(ops):
    root_tag = get_root_tag(ops, assert_tag="OPS")

    ops_date = ops.get('OD')
    ops_time = ops.get('OT')
    
    if ops_date and ops_time:
        try: 
            ops_datetime = datetime.strptime(
                " ".join([ops_date, ops_time]), 
                "%Y-%m-%d %H:%M"
            )
        except ValueError:
            logging.warning("OPS datetime could not be parsed")
            ops_datetime = None
    else:
        ops_datetime = None

    
    data = {
        "operation_number": ops.get('ON'),
        "operation_country":ops.get('FR'),
        "operation_datetime_utc": ops_datetime
    }

    return data, list(ops)
    
    
def root_tag_checker(el: xml.etree.ElementTree.Element, 
                     assert_tag: str, 
                     result_key: str, 
                     forward_children: bool):
    root_tag = get_root_tag(el, assert_tag=assert_tag)
    children = list(el) if forward_children else []
    return {result_key: root_tag}, children
    

def parse_ers(ers):
    root_tag = get_root_tag(ers, assert_tag='ERS')

    ers_date = ers.get('RD')
    ers_time = ers.get('RT')
    
    if ers_date and ers_time:
        try: 
            ers_datetime = datetime.strptime(
                " ".join([ers_date, ers_time]), 
                "%Y-%m-%d %H:%M"
            )
        except ValueError:
            logging.warning("ERS datetime could not be parsed")
            ers_datetime = None
    else:
        ers_datetime = None

    
    data = {
        "ers_id" : ers.get('RN'),
        "ers_datetime_utc" : ers_datetime
    }
    
    return data, list(ers)

    
def parse_log(log):
    root_tag = get_root_tag(log, assert_tag='LOG')
    
    logs = [get_root_tag(child) for child in list(log)
            if remove_namespace(child.tag) != 'ELOG']
    
    log_types = ["far", "dep", "rlc", "tra", "coe", "cox", "cro", "trz", 
                 "ins", "dis", "pno", "pnt", "eof", "rtp", "lan"]
    default_type_count = {t : 0 for t in log_types}

    logs_count = dict(Counter(logs))
    logs_count = {str.lower(k): v for k, v in logs_count.items()}
    logs_count = {**default_type_count, **logs_count}
    
    data = {
        "cfr":log.get('IR'),
        "ircs":log.get('RC'),
        "external_identification":log.get('XR'),
        "vessel_name":log.get('NA'),
        "flag_state":log.get('FS'),
        "imo":log.get('IM')
    }
    
    data = {**data, **logs_count}
    return data, []

    
def parse_sal(e):
    pass


parsers = {
    "DAT": partial(root_tag_checker, assert_tag="DAT", result_key="operation_type", forward_children=True),
    "RET": partial(root_tag_checker, assert_tag="RET", result_key="operation_type", forward_children=False),
    "DEL": partial(root_tag_checker, assert_tag="DEL", result_key="operation_type", forward_children=False),
    "COR": partial(root_tag_checker, assert_tag="COR", result_key="operation_type", forward_children=True),
    "QUE": partial(root_tag_checker, assert_tag="QUE", result_key="operation_type", forward_children=False),
    "RSP": partial(root_tag_checker, assert_tag="RSP", result_key="operation_type", forward_children=False),
    "ERS": parse_ers,
    "LOG": parse_log,
    "SAL": parse_sal,
    "OPS": parse_ops,
    "DEP": partial(root_tag_checker, assert_tag="DEP", result_key="log_type", forward_children=False),
    "RLC": partial(root_tag_checker, assert_tag="RLC", result_key="log_type", forward_children=False),
    "TRA": partial(root_tag_checker, assert_tag="TRA", result_key="log_type", forward_children=False),
    "COE": partial(root_tag_checker, assert_tag="COE", result_key="log_type", forward_children=False),
    "COX": partial(root_tag_checker, assert_tag="COX", result_key="log_type", forward_children=False),
    "CRO": partial(root_tag_checker, assert_tag="CRO", result_key="log_type", forward_children=False),
    "TRZ": partial(root_tag_checker, assert_tag="TRZ", result_key="log_type", forward_children=False),    
    "INS": partial(root_tag_checker, assert_tag="INS", result_key="log_type", forward_children=False),    
    "DIS": partial(root_tag_checker, assert_tag="DIS", result_key="log_type", forward_children=False),    
    "PNO": partial(root_tag_checker, assert_tag="PNO", result_key="log_type", forward_children=False),    
    "PNT": partial(root_tag_checker, assert_tag="PNT", result_key="log_type", forward_children=False),    
    "EOF": partial(root_tag_checker, assert_tag="EOF", result_key="log_type", forward_children=False),    
    "RTP": partial(root_tag_checker, assert_tag="RTP", result_key="log_type", forward_children=False),    
    "LAN": partial(root_tag_checker, assert_tag="LAN", result_key="log_type", forward_children=False),
}


def parse(el):
    root_tag = get_root_tag(el)
    try:
        parser = parsers[root_tag]
    except:
        logging.warning("Parser not implemented for xml tag: ", root_tag)
        return {}
    data, children = parser(el)
    if len(children) == 0:
        return data
    else:
        for child in children:
            data = {**data, **parse(child)}
        return data
    
    
def parse_xml_string(xml_string):
    try: 
        el = ET.fromstring(xml_string.strip('¿'))
    except ParseError:
        logging.warning(f"XML message '{xml_string[:20]}...' could not be parsed, returning empty data.")
        return {}
    return parse(el)

