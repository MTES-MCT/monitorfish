import { getTextForSearch } from '../../utils'

export const mapToRegulatoryZone = properties => {
  return {
    lawType: properties.law_type,
    topic: properties.layer_name,
    prohibitedGears: properties.engins_interdits,
    gears: properties.engins,
    zone: properties.zones,
    species: properties.especes,
    prohibitedSpecies: properties.especes_interdites,
    regulatoryReferences: properties.references_reglementaires,
    upcomingRegulatoryReferences: properties.references_reglementaires_a_venir,
    permissions: properties.autorisations,
    bycatch: properties.captures_accessoires,
    openingDate: properties.date_ouverture,
    closingDate: properties.date_fermeture,
    mandatoryDocuments: properties.documents_obligatoires,
    state: properties.etat,
    prohibitions: properties.interdictions,
    technicalMeasurements: properties.mesures_techniques,
    period: properties.periodes,
    quantity: properties.quantites,
    size: properties.taille,
    region: properties.region,
    seafront: properties.facade,
    obligations: properties.obligations,
    rejections: properties.rejets,
    deposit: properties.gisement
  }
}

export const mapToRegulatoryFeatureObject = properties => {
  const {
    selectedRegulationTopic,
    selectedRegulationLawType,
    nameZone,
    selectedSeaFront,
    selectedRegionList,
    regulatoryTexts,
    upcomingRegulation
  } = properties
  return {
    layer_name: selectedRegulationTopic,
    law_type: selectedRegulationLawType.split(' /')[0],
    zones: nameZone,
    region: selectedRegionList.join(', '),
    facade: selectedSeaFront,
    references_reglementaires: JSON.stringify(regulatoryTexts),
    references_reglementaires_a_venir: JSON.stringify(upcomingRegulation)
  }
}

export const emptyRegulatoryFeatureObject = {
  layer_name: null,
  law_type: null,
  zones: null,
  region: null,
  facade: null,
  references_reglementaires: null
}

export const LawTypesToTerritory = {
  'Reg locale': 'France',
  'Reg 494 - Merlu': 'UE',
  'R(UE) 2019/1241': 'UE',
  'R(UE) 1380/2013': 'UE'
}

export const RegulatoryTerritory = {
  France: 'Réglementation France',
  UE: 'Réglementation UE'
}

export const REGULATORY_SEARCH_PROPERTIES = {
  TOPIC: 'topic',
  ZONE: 'zone',
  REGION: 'region',
  SEAFRONT: 'seafront',
  GEARS: 'gears',
  SPECIES: 'species',
  REGULATORY_REFERENCES: 'regulatoryReferences'
}

export function findIfSearchStringIncludedInProperty (zone, propertiesToSearch, searchText) {
  return zone[propertiesToSearch] && searchText
    ? getTextForSearch(zone[propertiesToSearch]).includes(getTextForSearch(searchText))
    : false
}

export function searchByLawType (lawTypes, properties, searchText, gears) {
  const searchResultByLawType = {}

  Object.keys(lawTypes).forEach(lawType => {
    const regulatoryZone = Object.assign({}, lawTypes[lawType])
    const foundRegulatoryZones = search(searchText, properties, regulatoryZone, gears)

    if (foundRegulatoryZones && Object.keys(foundRegulatoryZones).length !== 0) {
      searchResultByLawType[lawType] = foundRegulatoryZones
    }
  })

  return searchResultByLawType
}

export function findIfStringIsIncludedInZoneGears (zone, searchText, uniqueGearCodes) {
  const gears = zone.gears
  if (gears) {
    const gearsArray = gears.replace(/ /g, '').split(',')
    const found = gearCodeIsFoundInRegulatoryZone(gearsArray, uniqueGearCodes)

    return found || gears.toLowerCase().includes(searchText.toLowerCase())
  } else {
    return false
  }
}

export function search (searchText, propertiesToSearch, regulatoryZones, gears) {
  if (regulatoryZones) {
    const foundRegulatoryZones = { ...regulatoryZones }

    let uniqueGearCodes = null
    if (propertiesToSearch.includes(REGULATORY_SEARCH_PROPERTIES.GEARS)) {
      uniqueGearCodes = getUniqueGearCodesFromSearch(searchText, gears)
    }

    Object.keys(foundRegulatoryZones)
      .forEach(key => {
        foundRegulatoryZones[key] = foundRegulatoryZones[key]
          .filter(zone => {
            let searchStringIncludedInProperty = false
            propertiesToSearch.forEach(property => {
              if (property === REGULATORY_SEARCH_PROPERTIES.GEARS) {
                searchStringIncludedInProperty = findIfStringIsIncludedInZoneGears(zone, searchText, uniqueGearCodes)
              } else {
                searchStringIncludedInProperty =
                  searchStringIncludedInProperty || findIfSearchStringIncludedInProperty(zone, property, searchText)
              }
            })
            return searchStringIncludedInProperty
          })
        if (!foundRegulatoryZones[key] || !foundRegulatoryZones[key].length > 0) {
          delete foundRegulatoryZones[key]
        }
      })

    return foundRegulatoryZones
  }
}

export function getUniqueGearCodesFromSearch (searchText, gears) {
  const foundGearCodes = gears
    .filter(gear => gear.name.toLowerCase().includes(searchText.toLowerCase()))
    .map(gear => gear.code)
  return [...new Set(foundGearCodes)]
}

export function gearCodeIsFoundInRegulatoryZone (gears, uniqueGearCodes) {
  return gears.some(gearCodeFromREG => {
    return !!uniqueGearCodes.some(foundGearCode => foundGearCode === gearCodeFromREG)
  })
}

export function orderByAlphabeticalLayer (foundRegulatoryLayers) {
  if (foundRegulatoryLayers) {
    Object.keys(foundRegulatoryLayers).forEach(lawType => {
      Object.keys(foundRegulatoryLayers[lawType]).forEach(topic => {
        foundRegulatoryLayers[lawType][topic] = foundRegulatoryLayers[lawType][topic].sort((a, b) => {
          if (a.zone && b.zone) {
            return a.zone.localeCompare(b.zone)
          }

          return null
        })
      })
    })
  }
}

export function getMergedRegulatoryLayers (previousFoundRegulatoryLayers, nextFoundRegulatoryLayers) {
  const mergedRegulatoryLayers = {}

  Object.keys(previousFoundRegulatoryLayers).forEach(lawType => {
    if (previousFoundRegulatoryLayers[lawType]) {
      Object.keys(previousFoundRegulatoryLayers[lawType]).forEach(regulatoryTopic => {
        previousFoundRegulatoryLayers[lawType][regulatoryTopic].forEach(zone => {
          if (nextFoundRegulatoryLayers &&
            nextFoundRegulatoryLayers[lawType] &&
            nextFoundRegulatoryLayers[lawType][regulatoryTopic] &&
            nextFoundRegulatoryLayers[lawType][regulatoryTopic].length &&
            nextFoundRegulatoryLayers[lawType][regulatoryTopic].some(searchZone =>
              searchZone.topic === zone.topic &&
              searchZone.zone === zone.zone
            )) {
            if (mergedRegulatoryLayers[lawType] && mergedRegulatoryLayers[lawType][regulatoryTopic]) {
              mergedRegulatoryLayers[lawType][regulatoryTopic] = mergedRegulatoryLayers[lawType][regulatoryTopic].concat(zone)
            } else {
              if (!mergedRegulatoryLayers[lawType]) {
                mergedRegulatoryLayers[lawType] = {}
              }
              mergedRegulatoryLayers[lawType][regulatoryTopic] = [].concat(zone)
            }
          }
        })
      })
    }
  })

  return mergedRegulatoryLayers
}
