import xml

from src.pipeline.parsers.flux.childless_parsers import (
    parse_gea,
    parse_ras,
    parse_spe,
)
from src.utils.flux import (
    get_type,
    get_text,
    get_element,
    tagged_children,
    try_float,
    try_float
)

def default_log_parser(el: xml.etree.ElementTree.Element):
    return {"log_type": get_type(el)}


def parse_dep(dep):

    value = {
        "departureDatetimeUtc": get_text(dep,'.//ram:OccurrenceDateTime/udt:DateTime'),
        "departurePort": get_text(dep,'.//ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'),
        "anticipatedActivity": get_text(dep,'.//ram:ReasonCode[@listID="FA_REASON_DEPARTURE"]'),
    }

    children = tagged_children(dep)

    if "SpecifiedFishingGear" in children:
        gear = [parse_gea(gea) for gea in children["SpecifiedFishingGear"]]
        value["gearOnboard"] = gear

    if "SpecifiedFACatch" in children:
        species_onboard = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        value["speciesOnboard"] = species_onboard

    data = {"log_type": "DEP", "value": value}
    return data


def parse_far(far):

    value = {"farDatetimeUtc": get_text(far,'.//ram:OccurrenceDateTime/udt:DateTime')}

    children = tagged_children(far)

    if "SpecifiedFishingGear" in children:
        gea = get_element(far,'.//ram:SpecifiedFishingGear')
        gear = parse_gea(gea)
        value = {**value, **gear}

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        value["catches"] = catches

    pos=get_element(far,'.//ram:SpecifiedPhysicalFLUXGeographicalCoordinate')
    if  pos != None:
        value["latitude"] = try_float(get_text(pos,'.//ram:LatitudeMeasure'))
        value["longitude"] = try_float(get_text(pos,'.//ram:LongitudeMeasure'))

    data = {"log_type": "FAR", "value": value}

    return data


def parse_dis(dis):

    value = {"discardDatetimeUtc": get_text(dis,'.//ram:OccurrenceDateTime/udt:DateTime')}

    children = tagged_children(dis)

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        value["catches"] = catches

    data = {"log_type": "DIS", "value": value}

    return data


def parse_coe(coe):
    date = coe.get("DA")
    time = coe.get("TI")
    
    children = tagged_children(coe)

    value = {
        "effortZoneEntryDatetimeUtc": get_text(coe,'.//ram:OccurrenceDateTime/udt:DateTime'),
        "targetSpeciesOnEntry": get_text(coe,'.//ram:SpeciesTargetCode[@listID="TARGET_SPECIES_GROUP"]'),
    }

    if "RelatedFLUXLocation" in children:
        value["faoZoneEntered"] = get_text(coe,'.//*[@schemeID="FAO_AREA"]')
        value["economicZoneEntered"] = get_text(coe,'.//*[@schemeID="TERRITORY"]')
        value["statisticalRectangleEntered"] = get_text(coe,'.//*[@schemeID="STAT_RECTANGLE"]')
        value["effortZoneEntered"] = get_text(coe,'.//*[@schemeID="EFFORT_ZONE"]')

    pos=get_element(coe,'.//ram:SpecifiedPhysicalFLUXGeographicalCoordinate')
    if  pos != None:
        value["latitude"] = try_float(get_text(pos,'.//ram:LatitudeMeasure'))
        value["longitude"] = try_float(get_text(pos,'.//ram:LongitudeMeasure'))


    data = {"log_type": "COE", "value": value}

    return data


def parse_cox(cox):
    children = tagged_children(cox)

    value = {
        "effortZoneExitDatetimeUtc": get_text(cox,'.//ram:OccurrenceDateTime/udt:DateTime'),
        "targetSpeciesOnExit": get_text(cox,'.//ram:SpeciesTargetCode[@listID="FAO_SPECIES"]'),
    }

    if "RelatedFLUXLocation" in children:
        value["faoZoneExited"] = get_text(cox,'.//*[@schemeID="FAO_AREA"]')
        value["economicZoneExited"] = get_text(cox,'.//*[@schemeID="TERRITORY"]')
        value["statisticalRectangleExited"] = get_text(cox,'.//*[@schemeID="STAT_RECTANGLE"]')
        value["effortZoneExited"] = get_text(cox,'.//*[@schemeID="EFFORT_ZONE"]')

    pos=get_element(cox,'.//ram:SpecifiedPhysicalFLUXGeographicalCoordinate')
    if pos != None:
        value["latitudeExited"] = try_float(get_text(pos,'.//ram:LatitudeMeasure'))
        value["longitudeExited"] = try_float(get_text(pos,'.//ram:LongitudeMeasure'))

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

    children = tagged_children(pno)

    value = {
        "predictedArrivalDatetimeUtc": get_text(pno,'.//ram:OccurrenceDateTime/udt:DateTime'),
        "port": get_text(pno,'.//ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'),
        "purpose": get_text(pno,'.//ram:ReasonCode'),
        "tripStartDate": get_text(pno,'.//ram:EndDateTime/udt:DateTime'),
    }
    
    if "RelatedFLUXLocation" in children:
        ras = get_element(pno,'.//ram:RelatedFLUXLocation')
        ras_data = parse_ras(ras)
        value = {**value, **ras_data}

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        value["catchOnboard"] = catches

    pos=get_element(pno,'.//ram:SpecifiedPhysicalFLUXGeographicalCoordinate')
    if pos != None:
        value["latitude"] = try_float(get_text(pos,'.//ram:LatitudeMeasure'))
        value["longitude"] = try_float(get_text(pos,'.//ram:LongitudeMeasure'))

    data = {"log_type": "PNO", "value": value}

    return data


def parse_lan(lan):

    value = {
        "landingDatetimeUtc": get_text(lan,'.//ram:EndDateTime/udt:DateTime'),
        "port": get_text(lan,'.//ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'),
        "sender": get_text(lan,'.//ram:SpecifiedContactParty/ram:RoleCode[@listID="FLUX_CONTACT_ROLE"]'),
    }

    children = tagged_children(lan)

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        value["catchLanded"] = catches

    data = {"log_type": "LAN", "value": value}

    return data


def parse_rtp(rtp):
    value = {
        "returnDatetimeUtc": get_text(rtp,'.//ram:OccurrenceDateTime/udt:DateTime'),
        "port": get_text(rtp,'.//ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'),
        "reasonOfReturn": get_text(rtp,'.//ram:ReasonCode[@listID="FA_REASON_ARRIVAL"]'),
    }

    children = tagged_children(rtp)

    if "SpecifiedFishingGear" in children:
        gear = [parse_gea(gea) for gea in children["SpecifiedFishingGear"]]
        value["gearOnboard"] = gear

    data = {"log_type": "RTP", "value": value}

    return data
