from src.utils.ers import try_float, tagged_children
from .childless_parsers import ()


def parse_dep(dep):
    date = dep.get("DA")
    time = dep.get("TI")
    # cannot use DateTime because the data needs to be json serializable
    departure_datetime_utc = make_datetime_json_serializable(date, time)

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
    far_datetime_utc = make_datetime_json_serializable(date, time)

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
    discard_datetime_utc = make_datetime_json_serializable(date, time)

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
    predicted_arrival_datetime_utc = make_datetime_json_serializable(date, time)

    start_date = pno.get("DS")
    trip_start_date = make_datetime_json_serializable(start_date, None)

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
    landing_datetime_utc = make_datetime_json_serializable(date, time)

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
    end_of_fishing_datetime_utc = make_datetime_json_serializable(date, time)
    value = {"end_of_fishing_datetime_utc": end_of_fishing_datetime_utc}
    data = {"log_type": "EOF", "value": value}
    return None, None, None, data


def parse_rtp(rtp):
    date = rtp.get("DA")
    time = rtp.get("TI")
    return_datetime_utc = make_datetime_json_serializable(date, time)

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
