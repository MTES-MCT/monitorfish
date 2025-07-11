import xml

from src.parsers.ers.childless_parsers import (
    parse_edci,
    parse_gea,
    parse_pos,
    parse_ras,
    parse_spe,
)
from src.parsers.utils import (
    get_root_tag,
    make_datetime,
    serialize_datetime,
    tagged_children,
    try_float,
)


def default_log_parser(el: xml.etree.ElementTree.Element):
    return {"log_type": get_root_tag(el)}


def parse_dep(dep):
    date = dep.get("DA")
    time = dep.get("TI")
    # cannot use DateTime because the data needs to be json serializable
    activity_datetime_utc = make_datetime(date, time)
    departure_datetime_utc = serialize_datetime(activity_datetime_utc)

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

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "DEP",
        "value": value,
    }

    return data


def parse_far(far):
    date = far.get("DA")
    time = far.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    far_datetime_utc = serialize_datetime(activity_datetime_utc)

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

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "FAR",
        "value": {"hauls": [value]},
    }

    return data


def parse_ecps(ecps):
    date = ecps.get("DA")
    time = ecps.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    far_datetime_utc = serialize_datetime(activity_datetime_utc)

    value = {"cpsDatetimeUtc": far_datetime_utc}

    children = tagged_children(ecps)

    if "GEA" in children:
        assert len(children["GEA"]) == 1
        gear_el = children["GEA"][0]
        gear = parse_gea(gear_el)
        value = {**value, **gear}

    if "EDCI" in children:
        catches = [parse_edci(edci) for edci in children["EDCI"]]
        value["catches"] = catches

    if "POS" in children:
        assert len(children["POS"]) == 1
        pos = children["POS"][0]
        lat, lon = parse_pos(pos)
        value["latitude"] = try_float(lat)
        value["longitude"] = try_float(lon)

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "CPS",
        "value": value,
    }

    return data


def parse_dis(dis):
    date = dis.get("DA")
    time = dis.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    discard_datetime_utc = serialize_datetime(activity_datetime_utc)

    value = {"discardDatetimeUtc": discard_datetime_utc}

    children = tagged_children(dis)

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catches"] = catches

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "DIS",
        "value": value,
    }

    return data


def parse_coe(coe):
    date = coe.get("DA")
    time = coe.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    effort_zone_entry_datetime_utc = serialize_datetime(activity_datetime_utc)

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

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "COE",
        "value": value,
    }

    return data


def parse_cox(cox):
    date = cox.get("DA")
    time = cox.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    effort_zone_exit_datetime_utc = serialize_datetime(activity_datetime_utc)

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

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "COX",
        "value": value,
    }

    return data


def parse_cro(cro):
    children = tagged_children(cro)

    value = {}

    activity_datetime_utc = None

    if "COE" in children:
        assert len(children["COE"]) == 1
        coe = children["COE"][0]
        coe_data = parse_coe(coe)
        value = coe_data["value"]

    if "COX" in children:
        assert len(children["COX"]) == 1
        cox = children["COX"][0]
        cox_data = parse_cox(cox)
        activity_datetime_utc = cox_data["activity_datetime_utc"]
        cox_value = cox_data["value"]
        value = {**value, **cox_value}

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "CRO",
        "value": value,
    }
    return data


def parse_pno(pno):
    date = pno.get("PD")
    time = pno.get("PT")
    activity_datetime_utc = make_datetime(date, time)
    predicted_arrival_datetime_utc = serialize_datetime(activity_datetime_utc)

    date = pno.get("DA")
    time = pno.get("TI")
    predicted_landing_datetime_utc = serialize_datetime(make_datetime(date, time))

    start_date = pno.get("DS")
    trip_start_date = serialize_datetime(make_datetime(start_date, None))

    children = tagged_children(pno)

    value = {
        "predictedArrivalDatetimeUtc": predicted_arrival_datetime_utc,
        "predictedLandingDatetimeUtc": predicted_landing_datetime_utc,
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
        value["catchOnboard"] = [
            parse_spe(spe, catch_to_land=False) for spe in children["SPE"]
        ]
        value["catchToLand"] = [
            parse_spe(spe, catch_to_land=True) for spe in children["SPE"]
        ]

    if "POS" in children:
        assert len(children["POS"]) == 1
        pos = children["POS"][0]
        lat, lon = parse_pos(pos)
        value["latitude"] = try_float(lat)
        value["longitude"] = try_float(lon)

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "PNO",
        "value": value,
    }

    return data


def parse_lan(lan):
    date = lan.get("DA")
    time = lan.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    landing_datetime_utc = serialize_datetime(activity_datetime_utc)

    value = {
        "landingDatetimeUtc": landing_datetime_utc,
        "port": lan.get("PO"),
        "sender": lan.get("TS"),
    }

    children = tagged_children(lan)

    if "SPE" in children:
        catches = [parse_spe(spe) for spe in children["SPE"]]
        value["catchLanded"] = catches

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "LAN",
        "value": value,
    }

    return data


def parse_eof(eof):
    date = eof.get("DA")
    time = eof.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    end_of_fishing_datetime_utc = serialize_datetime(activity_datetime_utc)
    value = {"endOfFishingDatetimeUtc": end_of_fishing_datetime_utc}
    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "EOF",
        "value": value,
    }
    return data


def parse_rtp(rtp):
    date = rtp.get("DA")
    time = rtp.get("TI")
    activity_datetime_utc = make_datetime(date, time)
    return_datetime_utc = serialize_datetime(activity_datetime_utc)

    value = {
        "returnDatetimeUtc": return_datetime_utc,
        "port": rtp.get("PO"),
        "reasonOfReturn": rtp.get("RE"),
    }

    children = tagged_children(rtp)

    if "GEA" in children:
        gear = [parse_gea(gea) for gea in children["GEA"]]
        value["gearOnboard"] = gear

    data = {
        "activity_datetime_utc": activity_datetime_utc,
        "log_type": "RTP",
        "value": value,
    }

    return data
