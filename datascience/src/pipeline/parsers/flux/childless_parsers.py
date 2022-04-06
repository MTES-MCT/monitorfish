from src.pipeline.parsers.flux.utils import get_text, remove_none_values
from src.pipeline.parsers.utils import tagged_children, try_float


def parse_ras(ras):
    data = {
        "faoZone": get_text(ras, './/*[@schemeID="FAO_AREA"]'),
        "economicZone": get_text(ras, './/ram:ID[@schemeID="TERRITORY"]'),
        "statisticalRectangle": get_text(ras, './/*[@schemeID="STAT_RECTANGLE"]'),
        "effortZone": get_text(ras, './/*[@schemeID="EFFORT_ZONE"]'),
    }

    return remove_none_values(data)


def parse_pro(pro):
    data = {
        "presentation": get_text(pro, './/*[@listID="FISH_PRESENTATION"]'),
        "packaging": get_text(pro, './/*[@listID="FISH_PACKAGING"]'),
        "freshness": get_text(pro, './/*[@listID="FISH_FRESHNESS"]'),
        "preservationState": get_text(pro, './/*[@listID="FISH_PRESERVATION"]'),
        "conversionFactor": try_float(get_text(pro, ".//ram:ConversionFactorNumeric")),
    }
    return remove_none_values(data)


def parse_spe(spe):
    data = {
        "species": get_text(spe, './/ram:SpeciesCode[@listID="FAO_SPECIES"]'),
        "weight": try_float(get_text(spe, './/ram:WeightMeasure[@unitCode="KGM"]')),
        "nbFish": get_text(spe, ".//ram:UnitQuantity"),
    }

    children = tagged_children(spe)

    if "SpecifiedFLUXLocation" in children:
        for ras in children["SpecifiedFLUXLocation"]:
            ras_data = parse_ras(ras)
            data = {**data, **ras_data}
        data = complete_ras(data)

    if "AppliedAAPProcess" in children:
        for pro in children["AppliedAAPProcess"]:
            pro_data = parse_pro(pro)
            data = {**data, **pro_data}
        data = complete_pro(data)

    return data


def parse_gea(gea):

    data = {
        "gear": get_text(gea, './/ram:TypeCode[@listID="GEAR_TYPE"]'),
        "mesh": try_float(
            get_text(
                gea,
                ".//ram:ApplicableGearCharacteristic[ram:TypeCode='ME']/ram:ValueMeasure",
            )
        ),
        "dimensions": try_float(
            get_text(
                gea,
                "ram:ApplicableGearCharacteristic[ram:TypeCode='GM']/ram:ValueMeasure",
            )
        ),
    }

    return data


def complete_ras(ras):
    if "faoZone" not in ras:
        ras["faoZone"] = None
    if "economicZone" not in ras:
        ras["economicZone"] = None
    if "statisticalRectangle" not in ras:
        ras["statisticalRectangle"] = None
    if "effortZone" not in ras:
        ras["effortZone"] = None
    return ras


def complete_pro(pro):
    if "presentation" not in pro:
        pro["presentation"] = None
    if "packaging" not in pro:
        pro["packaging"] = None
    if "freshness" not in pro:
        pro["freshness"] = None
    if "preservationState" not in pro:
        pro["preservationState"] = None
    if "conversionFactor" not in pro:
        pro["conversionFactor"] = None
    return pro
