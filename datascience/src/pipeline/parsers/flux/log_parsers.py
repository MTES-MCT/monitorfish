import xml

from src.pipeline.parsers.flux.childless_parsers import (
    complete_ras,
    parse_gea,
    parse_ras,
    parse_spe,
)
from src.pipeline.parsers.flux.utils import NS_FLUX, get_element, get_text
from src.pipeline.parsers.utils import tagged_children, try_float


def null_parser(el: xml.etree.ElementTree.Element):
    return None


def parse_dep(dep):
    value = {
        "departureDatetimeUtc": get_text(dep, ".//ram:OccurrenceDateTime/udt:DateTime"),
        "departurePort": get_text(
            dep, './/ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'
        ),
        "anticipatedActivity": get_text(
            dep, './/ram:ReasonCode[@listID="FA_REASON_DEPARTURE"]'
        ),
    }

    children = tagged_children(dep)

    hasSpecifiedFishingGear = False
    if "SpecifiedFishingGear" in children:
        gear = [parse_gea(gea) for gea in children["SpecifiedFishingGear"]]
        value["gearOnboard"] = gear
        hasSpecifiedFishingGear = True
    if not hasSpecifiedFishingGear:
        usedGear = get_element(dep, ".//ram:SpecifiedFACatch/ram:UsedFishingGear")
        if usedGear is not None:
            value["gearOnboard"] = parse_gea(usedGear)

    zone_data = {}
    if "RelatedFLUXLocation" in children:
        for ras in children["RelatedFLUXLocation"]:
            data = parse_ras(ras)
            zone_data = {**zone_data, **data}
        hasRelatedFLUXLocation = bool(zone_data)
        zone_data = complete_ras(zone_data)

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        if hasRelatedFLUXLocation:
            catches = [dict(item, **zone_data) for item in catches]
        value["speciesOnboard"] = catches

    return value


def parse_far(far):
    value = {"farDatetimeUtc": get_text(far, ".//ram:OccurrenceDateTime/udt:DateTime")}

    children = tagged_children(far)

    hasSpecifiedFishingGear = False
    if "SpecifiedFishingGear" in children:
        gea = get_element(far, ".//ram:SpecifiedFishingGear")
        gear = parse_gea(gea)
        value = {**value, **gear}
        hasSpecifiedFishingGear = True
    if not hasSpecifiedFishingGear:
        usedGear = get_element(far, ".//ram:SpecifiedFACatch/ram:UsedFishingGear")
        if usedGear is not None:
            value = {**value, **parse_gea(usedGear)}

    zone_data = {}
    hasRelatedFLUXLocation = False

    if "RelatedFLUXLocation" in children:
        for ras in children["RelatedFLUXLocation"]:
            data = parse_ras(ras)
            zone_data = {**zone_data, **data}
        hasRelatedFLUXLocation = bool(zone_data)
        zone_data = complete_ras(zone_data)

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        if hasRelatedFLUXLocation:
            catches = [dict(item, **zone_data) for item in catches]
        value["catches"] = catches

    pos = get_element(
        far, "./ram:RelatedFLUXLocation/ram:SpecifiedPhysicalFLUXGeographicalCoordinate"
    )
    if pos is not None:
        value["latitude"] = try_float(get_text(pos, ".//ram:LatitudeMeasure"))
        value["longitude"] = try_float(get_text(pos, ".//ram:LongitudeMeasure"))

    return value


def parse_dis(dis):
    value = {
        "discardDatetimeUtc": get_text(dis, ".//ram:OccurrenceDateTime/udt:DateTime")
    }

    children = tagged_children(dis)

    zone_data = {}
    hasRelatedFLUXLocation = False

    if "RelatedFLUXLocation" in children:
        for ras in children["RelatedFLUXLocation"]:
            data = parse_ras(ras)
            zone_data = {**zone_data, **data}
        hasRelatedFLUXLocation = bool(zone_data)
        zone_data = complete_ras(zone_data)

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        if hasRelatedFLUXLocation:
            catches = [dict(item, **zone_data) for item in catches]
        value["catches"] = catches

    return value


def parse_coe(coe):
    children = tagged_children(coe)

    value = {
        "effortZoneEntryDatetimeUtc": get_text(
            coe, ".//ram:OccurrenceDateTime/udt:DateTime"
        ),
        "targetSpeciesOnEntry": get_text(
            coe, './/ram:SpeciesTargetCode[@listID="TARGET_SPECIES_GROUP"]'
        ),
    }

    if "RelatedFLUXLocation" in children:
        value["faoZoneEntered"] = get_text(coe, './/*[@schemeID="FAO_AREA"]')
        value["economicZoneEntered"] = get_text(coe, './/*[@schemeID="TERRITORY"]')
        value["statisticalRectangleEntered"] = get_text(
            coe, './/*[@schemeID="STAT_RECTANGLE"]'
        )
        value["effortZoneEntered"] = get_text(coe, './/*[@schemeID="EFFORT_ZONE"]')

    pos = get_element(coe, ".//ram:SpecifiedPhysicalFLUXGeographicalCoordinate")
    if pos is not None:
        value["latitudeEntered"] = try_float(get_text(pos, ".//ram:LatitudeMeasure"))
        value["longitudeEntered"] = try_float(get_text(pos, ".//ram:LongitudeMeasure"))

    return value


def parse_cox(cox):
    children = tagged_children(cox)

    value = {
        "effortZoneExitDatetimeUtc": get_text(
            cox, ".//ram:OccurrenceDateTime/udt:DateTime"
        ),
        "targetSpeciesOnExit": get_text(
            cox, './/ram:SpeciesTargetCode[@listID="FAO_SPECIES"]'
        ),
    }

    if "RelatedFLUXLocation" in children:
        value["faoZoneExited"] = get_text(cox, './/*[@schemeID="FAO_AREA"]')
        value["economicZoneExited"] = get_text(cox, './/*[@schemeID="TERRITORY"]')
        value["statisticalRectangleExited"] = get_text(
            cox, './/*[@schemeID="STAT_RECTANGLE"]'
        )
        value["effortZoneExited"] = get_text(cox, './/*[@schemeID="EFFORT_ZONE"]')

    pos = get_element(cox, ".//ram:SpecifiedPhysicalFLUXGeographicalCoordinate")
    if pos is not None:
        value["latitudeExited"] = try_float(get_text(pos, ".//ram:LatitudeMeasure"))
        value["longitudeExited"] = try_float(get_text(pos, ".//ram:LongitudeMeasure"))

    return value


def parse_pno(pno):
    children = tagged_children(pno)

    value = {
        "predictedArrivalDatetimeUtc": get_text(
            pno, ".//ram:OccurrenceDateTime/udt:DateTime"
        ),
        "port": get_text(
            pno, './/ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'
        ),
        "purpose": get_text(pno, ".//ram:ReasonCode"),
        "tripStartDate": get_text(pno, ".//ram:StartDateTime/udt:DateTime"),
    }

    zone_data = {}
    hasRelatedFLUXLocation = False

    if "RelatedFLUXLocation" in children:
        for ras in children["RelatedFLUXLocation"]:
            data = parse_ras(ras)
            zone_data = {**zone_data, **data}
        hasRelatedFLUXLocation = bool(zone_data)
        zone_data = complete_ras(zone_data)

    if "SpecifiedFACatch" in children:
        catch_onboard = pno.findall(
            ".//ram:SpecifiedFACatch[ram:TypeCode='ONBOARD']", NS_FLUX
        )
        catch_to_land = pno.findall(
            ".//ram:SpecifiedFACatch[ram:TypeCode='UNLOADED']", NS_FLUX
        )
        catch_onboard = [parse_spe(spe) for spe in catch_onboard]
        catch_to_land = [parse_spe(spe) for spe in catch_to_land]
        if hasRelatedFLUXLocation:
            catch_to_land = [dict(item, **zone_data) for item in catch_to_land]
            catch_onboard = [dict(item, **zone_data) for item in catch_onboard]
        value["catchOnboard"] = catch_onboard
        value["catchToLand"] = catch_to_land

    pos = get_element(pno, ".//ram:SpecifiedPhysicalFLUXGeographicalCoordinate")
    if pos is not None:
        value["latitude"] = try_float(get_text(pos, ".//ram:LatitudeMeasure"))
        value["longitude"] = try_float(get_text(pos, ".//ram:LongitudeMeasure"))

    return value


def parse_lan(lan):
    value = {
        "landingDatetimeUtc": get_text(lan, ".//ram:EndDateTime/udt:DateTime"),
        "port": get_text(
            lan, './/ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'
        ),
        "sender": get_text(
            lan,
            './/ram:SpecifiedContactParty/ram:RoleCode[@listID="FLUX_CONTACT_ROLE"]',
        ),
    }

    children = tagged_children(lan)

    zone_data = {}
    hasRelatedFLUXLocation = False

    if "RelatedFLUXLocation" in children:
        for ras in children["RelatedFLUXLocation"]:
            data = parse_ras(ras)
            zone_data = {**zone_data, **data}
        hasRelatedFLUXLocation = bool(zone_data)
        zone_data = complete_ras(zone_data)

    if "SpecifiedFACatch" in children:
        catches = [parse_spe(spe) for spe in children["SpecifiedFACatch"]]
        if hasRelatedFLUXLocation:
            catches = [dict(item, **zone_data) for item in catches]
        value["catchLanded"] = catches

    return value


def parse_rtp(rtp):
    value = {
        "returnDatetimeUtc": get_text(rtp, ".//ram:OccurrenceDateTime/udt:DateTime"),
        "port": get_text(
            rtp, './/ram:RelatedFLUXLocation/ram:ID[@schemeID="LOCATION"]'
        ),
        "reasonOfReturn": get_text(
            rtp, './/ram:ReasonCode[@listID="FA_REASON_ARRIVAL"]'
        ),
    }

    children = tagged_children(rtp)

    hasSpecifiedFishingGear = False
    if "SpecifiedFishingGear" in children:
        gear = [parse_gea(gea) for gea in children["SpecifiedFishingGear"]]
        value["gearOnboard"] = gear
        hasSpecifiedFishingGear = True
    if not hasSpecifiedFishingGear:
        usedGear = get_element(rtp, ".//ram:SpecifiedFACatch/ram:UsedFishingGear")
        if usedGear is not None:
            value["gearOnboard"] = parse_gea(usedGear)

    return value
