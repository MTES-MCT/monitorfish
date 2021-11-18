import xml

from src.pipeline.parsers.ers.childless_parsers import (
    parse_gea,
    parse_pos,
    parse_ras,
    parse_spe,
)
from src.pipeline.parsers.utils import (
    get_root_tag,
    tagged_children,
    try_float,
)
from src.utils.ers import make_datetime_json_serializable


def default_log_parser(el: xml.etree.ElementTree.Element):
    return {"log_type": get_root_tag(el)}


def parse_dep(dep):
    date = dep.get("DA")
    time = dep.get("TI")
    # cannot use DateTime because the data needs to be json serializable
    departure_datetime_utc = make_datetime_json_serializable(date, time)

    value = {
        "departureDatetimeUtc": departure_datetime_utc,
        "departurePort": dep.get("PO"),
        "anticipatedActivity": dep.get("AA"),
    }

    children = tagged_children(dep)

    if "GEA" in children:
        gear = [parse_gea(gea) for gea in children["GEA"]]
        value["gearOnboard"] = gear

    if "SPE" in children:
        species_onboard = [parse_spe(spe) for spe in children["SPE"]]
        value["speciesOnboard"] = species_onboard

    data = {"log_type": "DEP", "value": value}

    return data


def parse_far(far):
    date = far.get("DA")
    time = far.get("TI")
    far_datetime_utc = make_datetime_json_serializable(date, time)

    value = {"farDatetimeUtc": far_datetime_utc}

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

    return data


def parse_dis(dis):
    date = dis.get("DA")
    time = dis.get("TI")
    discard_datetime_utc = make_datetime_json_serializable(date, time)

    value = {"discardDatetimeUtc": discard_datetime_utc}

    children = tagged_children(dis)

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catches"] = catches

    data = {"log_type": "DIS", "value": value}

    return data


def parse_coe(coe):
    date = coe.get("DA")
    time = coe.get("TI")
    effort_zone_entry_datetime_utc = make_datetime_json_serializable(date, time)

    children = tagged_children(coe)

    value = {
        "effortZoneEntryDatetimeUtc": effort_zone_entry_datetime_utc,
        "targetSpeciesOnEntry": coe.get("TS"),
    }

    if "RAS" in children:
        assert len(children["RAS"]) == 1
        ras = children["RAS"][0]
        ras_data = parse_ras(ras)
        value["faoZoneEntered"] = ras_data["faoZone"]
        value["economicZoneEntered"] = ras_data["economicZone"]
        value["statisticalRectangleEntered"] = ras_data["statisticalRectangle"]
        value["effortZoneEntered"] = ras_data["effortZone"]

    if "POS" in children:
        assert len(children["POS"]) == 1
        pos = children["POS"][0]
        lat, lon = parse_pos(pos)
        value["latitudeEntered"] = try_float(lat)
        value["longitudeEntered"] = try_float(lon)

    data = {"log_type": "COE", "value": value}

    return data


def parse_cox(cox):
    date = cox.get("DA")
    time = cox.get("TI")
    effort_zone_exit_datetime_utc = make_datetime_json_serializable(date, time)

    children = tagged_children(cox)

    value = {
        "effortZoneExitDatetimeUtc": effort_zone_exit_datetime_utc,
        "targetSpeciesOnExit": cox.get("TS"),
    }

    if "RAS" in children:
        assert len(children["RAS"]) == 1
        ras = children["RAS"][0]
        ras_data = parse_ras(ras)
        value["faoZoneExited"] = ras_data["faoZone"]
        value["economicZoneExited"] = ras_data["economicZone"]
        value["statisticalRectangleExited"] = ras_data["statisticalRectangle"]
        value["effortZoneExited"] = ras_data["effortZone"]

    if "POS" in children:
        assert len(children["POS"]) == 1
        pos = children["POS"][0]
        lat, lon = parse_pos(pos)
        value["latitudeExited"] = try_float(lat)
        value["longitudeExited"] = try_float(lon)

    data = {"log_type": "COX", "value": value}

    return data


def parse_cro(cro):
    children = tagged_children(cro)

    value = {}

    if "COE" in children:
        assert len(children["COE"]) == 1
        coe = children["COE"][0]
        coe_data = parse_coe(coe)
        value = coe_data["value"]

    if "COX" in children:
        assert len(children["COX"]) == 1
        cox = children["COX"][0]
        cox_data = parse_cox(cox)
        cox_value = cox_data["value"]
        value = {**value, **cox_value}

    data = {"log_type": "CRO", "value": value}
    return data


def parse_pno(pno):
    date = pno.get("PD")
    time = pno.get("PT")
    predicted_arrival_datetime_utc = make_datetime_json_serializable(date, time)

    start_date = pno.get("DS")
    trip_start_date = make_datetime_json_serializable(start_date, None)

    children = tagged_children(pno)

    value = {
        "predictedArrivalDatetimeUtc": predicted_arrival_datetime_utc,
        "port": pno.get("PO"),
        "purpose": pno.get("PC"),
        "tripStartDate": trip_start_date,
    }

    if "RAS" in children:
        assert len(children["RAS"]) == 1
        ras = children["RAS"][0]
        ras_data = parse_ras(ras)
        value = {**value, **ras_data}

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catchOnboard"] = catches

    if "POS" in children:
        assert len(children["POS"]) == 1
        pos = children["POS"][0]
        lat, lon = parse_pos(pos)
        value["latitude"] = try_float(lat)
        value["longitude"] = try_float(lon)

    data = {"log_type": "PNO", "value": value}

    return data


def parse_lan(lan):
    date = lan.get("DA")
    time = lan.get("TI")
    landing_datetime_utc = make_datetime_json_serializable(date, time)

    value = {
        "landingDatetimeUtc": landing_datetime_utc,
        "port": lan.get("PO"),
        "sender": lan.get("TS"),
    }

    children = tagged_children(lan)

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catchLanded"] = catches

    data = {"log_type": "LAN", "value": value}

    return data


def parse_eof(eof):
    date = eof.get("DA")
    time = eof.get("TI")
    end_of_fishing_datetime_utc = make_datetime_json_serializable(date, time)
    value = {"endOfFishingDatetimeUtc": end_of_fishing_datetime_utc}
    data = {"log_type": "EOF", "value": value}
    return data


def parse_rtp(rtp):
    date = rtp.get("DA")
    time = rtp.get("TI")
    return_datetime_utc = make_datetime_json_serializable(date, time)

    value = {
        "returnDatetimeUtc": return_datetime_utc,
        "port": rtp.get("PO"),
        "reasonOfReturn": rtp.get("RE"),
    }

    children = tagged_children(rtp)

    if "GEA" in children:
        gear = [parse_gea(gea) for gea in children["GEA"]]
        value["gearOnboard"] = gear

    data = {"log_type": "RTP", "value": value}

    return data
