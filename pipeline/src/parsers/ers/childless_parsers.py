from src.parsers.utils import make_datetime, tagged_children, try_float, try_int
from src.processing import remove_nones_from_dict


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
        "faoZone": fao_zone,
        "economicZone": ras.get("EZ"),
        "statisticalRectangle": ras.get("SR"),
        "effortZone": ras.get("FE"),
    }

    return data


def parse_pro(pro):
    data = {
        "presentation": pro.get("PR"),
        "packaging": pro.get("TY"),
        "freshness": pro.get("FF"),
        "preservationState": pro.get("PS"),
        "conversionFactor": try_float(pro.get("CF")),
    }
    return data


def parse_spe(spe, catch_to_land: bool = False):
    weight_attribute = "WL" if catch_to_land else "WT"
    number_of_fish_attribute = "FL" if catch_to_land else "NF"

    data = {
        "species": spe.get("SN"),
        "weight": try_float(spe.get(weight_attribute)),
        "nbFish": try_float(spe.get(number_of_fish_attribute)),
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


def parse_edci(edci):
    data = {
        "sex": edci.get("SE"),
        "healthState": edci.get("HE"),
        "careMinutes": try_int(edci.get("CA")),
        "ring": edci.get("RI"),
        "fate": edci.get("FT"),
        "comment": edci.get("CO"),
    }

    children = tagged_children(edci)

    if "SPE" in children:
        assert len(children["SPE"]) == 1
        spe = children["SPE"][0]
        spe_data = parse_spe(spe)
        data = {**data, **spe_data}

    return data


def parse_pos(pos):
    return try_float(pos.get("LT")), try_float(pos.get("LG"))


def parse_gea(gea):
    data = {
        "gear": gea.get("GE"),
        "mesh": try_float(gea.get("ME")),
        "dimensions": gea.get("GC"),
    }

    return data


def parse_src(src):
    return {
        "landing_datetime_utc": make_datetime(src.get("DL")),
        "landing_port": src.get("PO"),
    }


def parse_css(css):
    children = tagged_children(css)

    data = {
        "unitPrice": try_float(css.get("FP")),
        "totalPrice": try_float(css.get("TP")),
        "currency": css.get("CR"),
        "fishSize": css.get("SF"),
        "productDestination": css.get("PP"),
        "withdrawn": css.get("WD"),
        "producerOrganizationUse": css.get("OP"),
    }

    assert "SPE" in children
    assert len(children["SPE"]) == 1
    data = {**data, **parse_spe(children["SPE"][0])}
    data = remove_nones_from_dict(data)

    return data


def parse_cst(cst):
    children = tagged_children(cst)

    data = {
        "fishSize": cst.get("SF"),
    }

    if "SPE" in children:
        assert len(children["SPE"]) == 1
        data["species"] = parse_spe(children["SPE"][0])

    return data
