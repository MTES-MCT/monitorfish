import logging
import xml
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime
from functools import partial
from xml.etree.ElementTree import ParseError

from typing import List, Union
from src.utils.ers import (
    remove_namespace,
    get_root_tag,
    get_first_child,
    make_datetime,
    try_float,
    tagged_children,
    xml_tag_structure_func_factory
)


def root_tag_checker(
    el: xml.etree.ElementTree.Element,
    metadata_key: Union[str, None] = None,
    forward_child: bool = False,
    data_key: Union[str, None] = None):
    root_tag = get_root_tag(el)
    if metadata_key:
        metadata = {metadata_key: root_tag}
    else:
        metadata = None
    if forward_child:
        child = get_first_child(el, assert_child_single=True)
    else:
        child = None
    if data_key:
        data = {data_key: root_tag}
    else:
        data = None
    logs = None
    return metadata, child, logs, data


def parse_ops(ops):
    ops_date = ops.get("OD")
    ops_time = ops.get("OT")

    ops_datetime = make_datetime(ops_date, ops_time)

    metadata = {
        "operation_number": ops.get("ON"),
        "operation_country": ops.get("FR"),
        "operation_datetime_utc": ops_datetime,
    }

    child = get_first_child(list(ops), assert_child_single=True)

    return metadata, child, None, None


def parse_cor(cor):
    metadata = {
        'operation_type': 'COR',
        'ers_id_to_delete_or_correct': cor.get('RN')
        }
    child = get_first_child(cor, assert_child_single=True)
    return metadata, child, None, None


def parse_del(del_):
    metadata = {
        'operation_type': 'DEL',
        'ers_id_to_delete_or_correct': del_.get('RN')
        }
    return metadata, None, None, None


def parse_ers(ers):
    ers_date = ers.get("RD")
    ers_time = ers.get("RT")

    ers_datetime = make_datetime(ers_date, ers_time)

    metadata = {"ers_id": ers.get("RN"), "ers_datetime_utc": ers_datetime}

    children = list(ers)
    child = get_first_child(children)

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

    return metadata, None, logs, None


def parse_gea(gea):

    data = {"gear": gea.get("GE"), "mesh": try_float(gea.get("ME"))}

    return data


def parse_ras(ras):
    fao_ids = [
        ras.get("FA"),
        ras.get("SA"),
        ras.get("ID"),
        ras.get("SD"),
        ras.get("UI"),
    ]

    fao_ids = [i for i in fao_ids if i]
    fao_zone = ".".join(fao_ids)

    data = {
        "fao_zone": fao_zone,
        "economic_zone": ras.get("EZ"),
        "statistical_rectangle": ras.get("SR"),
        "effort_zone": ras.get("FE"),
    }

    return data


def parse_pro(pro):
    data = {
        "presentation": pro.get("PR"),
        "packaging": pro.get("TY"),
        "freshness": pro.get("FF"),
        "preservation_state": pro.get("PS"),
    }
    return data


def parse_spe(spe):
    data = {
        "species": spe.get("SN"),
        "weight": try_float(spe.get("WT")),
        "nb_fish": try_float(spe.get("NF")),
    }

    children = tagged_children(spe)

    if "RAS" in children:
        assert len(children["RAS"]) == 1
        ras = children["RAS"][0]
        ras_data = parse_ras(ras)
        data = {**data, **ras_data}

    if "PRO" in children:
        assert len(children["PRO"]) == 1
        pro = children["PRO"][0]
        pro_data = parse_pro(pro)
        data = {**data, **pro_data}

    return data


def parse_pos(pos):
    return try_float(pos.get("LT")), try_float(pos.get("LG"))


def parse_dep(dep):
    date = dep.get("DA")
    time = dep.get("TI")
    departure_datetime_utc = make_datetime(date, time)

    value = {
        "departure_datetime_utc": departure_datetime_utc,
        "departure_port": dep.get("PO"),
        "anticipated_activity": dep.get("AA"),
    }

    children = tagged_children(dep)

    if "GEA" in children:
        gear = [parse_gea(gea) for gea in children["GEA"]]
        value["gear_onboard"] = gear

    if "SPE" in children:
        species_onboard = [parse_spe(spe) for spe in children["SPE"]]
        value["species_onboard"] = species_onboard

    data = {"log_type": "DEP", "value": value}

    return None, None, None, data


def parse_far(far):
    date = far.get("DA")
    time = far.get("TI")
    far_datetime_utc = make_datetime(date, time)

    value = {"far_datetime_utc": far_datetime_utc}

    children = tagged_children(far)

    if "GEA" in children:
        assert len(children["GEA"]) == 1
        gear_el = children["GEA"][0]
        gear = parse_gea(gear_el)
        value = {**value, **gear}

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catches"] = catches

    if "POS" in children:
        assert len(children["POS"]) == 1
        pos = children["POS"][0]
        lat, lon = parse_pos(pos)
        value["latitude"] = try_float(lat)
        value["longitude"] = try_float(lon)

    data = {"log_type": "FAR", "value": value}

    return None, None, None, data


def parse_dis(dis):
    date = dis.get("DA")
    time = dis.get("TI")
    discard_datetime_utc = make_datetime(date, time)

    value = {
        "discard_datetime_utc": discard_datetime_utc
    }

    children = tagged_children(dis)

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catches"] = catches

    data = {
        "log_type": "DIS",
        "value": value
    }

    return None, None, None, data


def parse_pno(pno):
    date = pno.get("PD")
    time = pno.get("PT")
    predicted_arrival_datetime_utc = make_datetime(date, time)

    start_date = pno.get("DS")
    trip_start_date = make_datetime(start_date, None).date()

    children = tagged_children(pno)

    value = {
        "predicted_arrival_datetime_utc": predicted_arrival_datetime_utc,
        "port": pno.get("PO"),
        "purpose": pno.get("PC"),
        "trip_start_date": trip_start_date,
    }

    if "RAS" in children:
        assert len(children["RAS"]) == 1
        ras = children["RAS"][0]
        ras_data = parse_ras(ras)
        value = {**value, **ras_data}

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catch_onboard"] = catches

    if "POS" in children:
        assert len(children["POS"]) == 1
        pos = children["POS"][0]
        lat, lon = parse_pos(pos)
        value["latitude"] = try_float(lat)
        value["longitude"] = try_float(lon)

    data = {"log_type": "PNO", "value": value}

    return None, None, None, data


def parse_lan(lan):
    date = lan.get("DA")
    time = lan.get("TI")
    landing_datetime_utc = make_datetime(date, time)

    value = {
        "landing_datetime_utc": landing_datetime_utc,
        "port": lan.get("PO"),
    }
    
    children = tagged_children(lan)

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catch_landed"] = catches

    data = {
        "log_type": "LAN",
        "value": value
    }

    return None, None, None, data


def parse_eof(eof):
    date = eof.get("DA")
    time = eof.get("TI")
    end_of_fishing_datetime_utc = make_datetime(date, time)
    value = {"end_of_fishing_datetime_utc": end_of_fishing_datetime_utc}
    data = {"log_type": "EOF", "value": value}
    return None, None, None, data


def parse_rtp(rtp):
    date = rtp.get("DA")
    time = rtp.get("TI")
    return_datetime_utc = make_datetime(date, time)

    value = {
        "return_datetime_utc": return_datetime_utc,
        "port": rtp.get("PO"),
        "reason_of_return": rtp.get("RE")
    }

    children = tagged_children(rtp)

    if "GEA" in children:
        gear = [parse_gea(gea) for gea in children["GEA"]]
        value["gear_onboard"] = gear

    data = {
        "log_type": "RTP",
        "value": value
    }

    return None, None, None, data

parsers = {
    "DAT": partial(
        root_tag_checker,
        metadata_key="operation_type",
        forward_child=True,
    ),
    "COR": parse_cor,
    "DEL": parse_del,
    "RET": partial(
        root_tag_checker,
        metadata_key="operation_type",
        forward_child=False,
    ),
    "QUE": partial(
        root_tag_checker,
        metadata_key="operation_type",
        forward_child=False,
    ),
    "RSP": partial(
        root_tag_checker,
        metadata_key="operation_type",
        forward_child=False,
    ),
    "OPS": parse_ops,
    "ERS": parse_ers,
    "LOG": parse_log,
    "DEP": parse_dep,
    "FAR": parse_far,
    "DIS": parse_dis,
    "EOF": parse_eof,
    "PNO": parse_pno,
    "RTP": parse_rtp,
    "LAN": parse_lan,
    "RLC": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    ),
    "TRA": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    ),
    "COE": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    ),
    "COX": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    ),
    "CRO": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    ),
    "TRZ": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    ),
    "INS": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    ),
    "PNT": partial(
        root_tag_checker,
        data_key="log_type",
        forward_child=False,
    )
}


def parse_(el):
    root_tag = get_root_tag(el)
    try:
        parser = parsers[root_tag]
    except:
        logging.warning("Parser not implemented for xml tag: ", root_tag)
        return {}
    return parser(el)


def parse(el):
    metadata, child, logs, data = parse_(el)

    if child is not None and not logs and data is None:
        child_metadata, data_iter = parse(child)
        return {**metadata, **child_metadata}, data_iter

    elif logs and child is None and data is None:

        def data_iter():
            for log in logs:
                _, _, _, data = parse_(log)
                yield data

        return metadata, data_iter()

    elif child is None and not logs:
        return metadata, iter([{"value": None}])
    else:
        logging.error("Parsing error")
        return {}


def parse_xml_string(xml_string):
    try:
        el = ET.fromstring(xml_string.strip("¿"))
    except ParseError:
        logging.warning(
            f"XML message '{xml_string[:20]}...' could not be parsed, returning empty data."
        )
        return {}
    return parse(el)


def batch_parse(ers_xmls:List[str]):
    """Parses a list of ERS messages and return 2 tables as DataFrames containing the
    information extracted from the messages.

    Args:
        ers_xmls (List[str]): list of ERS xml messages

    Returns:
        pd.DataFrame: Dataframe with parsed metadata, including a "value" column
            with json data extracted with the xml message
        pd.DataFrame:  Dataframe with parsed metadata, including a "xml_message" column
            with the original xml message
    """
    res= []
    raw_res = []

    for xml_message in tqdm.tqdm(ers_xmls):
        now = datetime.utcnow()
        raw = {"xml_message": xml_message, "raw_integration_datetime_utc": now}
        try:
            metadata, data_iterator = ers.parse_xml_string(xml_message)
            raw = {**metadata, **raw}
            for data in data_iterator:
                res.append(pd.Series({**metadata, **data, "parsed_integration_datetime_utc": now}))
                raw["parsed_integration_datetime_utc"] = now
        except:
            print("Error!")
        raw_res.append(pd.Series(raw))

    parsed = pd.concat(res, axis=1).T
    parsed_with_xml = pd.concat(raw_res, axis=1).T    

    return parsed, parsed_with_xml