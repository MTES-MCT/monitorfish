from src.pipeline.parsers.utils import tagged_children, try_float, try_int


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


def parse_spe(spe):
    data = {
        "species": spe.get("SN"),
        "weight": try_float(spe.get("WT")),
        "nbFish": try_float(spe.get("NF")),
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
        "health_state": edci.get("HE"),
        "care_minutes": try_int(edci.get("CA")),
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
