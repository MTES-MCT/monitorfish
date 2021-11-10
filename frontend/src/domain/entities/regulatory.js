import { getTextForSearch } from '../../utils'
import Layers from './layers'

export const mapToRegulatoryZone = properties => {
  return {
    id: properties.id,
    lawType: properties.law_type,
    topic: properties.layer_name,
    prohibitedGears: properties.engins_interdits,
    gears: properties.engins,
    zone: decodeURI(properties.zones),
    species: properties.especes,
    prohibitedSpecies: properties.especes_interdites,
    regulatoryReferences: properties.references_reglementaires,
    upcomingRegulatoryReferences: properties.references_reglementaires_a_venir,
    fishingPeriod: mapToFishingPeriodObject(properties.fishing_period),
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
    obligations: properties.obligations,
    rejections: properties.rejets,
    deposit: properties.gisement
  }
}

const mapToFishingPeriodObject = fishingPeriod => {
  if (fishingPeriod) {
    const {
      authorized,
      annualRecurrence,
      dateRanges,
      dates,
      weekdays,
      holidays,
      daytime,
      timeIntervals,
      otherInfo
    } = JSON.parse(fishingPeriod)

    const newDateRanges = dateRanges?.map(({ startDate, endDate }) => {
      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    })

    const newDates = dates?.map(date => new Date(date))

    const newTimeIntervals = timeIntervals?.map(({ from, to }) => {
      return {
        from: new Date(from),
        to: new Date(to)
      }
    })

    return {
      authorized,
      annualRecurrence,
      dateRanges: newDateRanges,
      dates: newDates,
      weekdays,
      holidays,
      daytime,
      timeIntervals: newTimeIntervals,
      otherInfo
    }
  } else {
    return initialFishingPeriodValues
  }
}

export const mapToRegulatoryFeatureObject = properties => {
  const {
    selectedRegulationTopic,
    selectedRegulationLawType,
    nameZone,
    selectedRegionList,
    regulatoryTexts,
    upcomingRegulation,
    fishingPeriod
  } = properties
  return {
    layer_name: selectedRegulationTopic,
    law_type: selectedRegulationLawType,
    zones: nameZone,
    region: selectedRegionList?.join(', '),
    references_reglementaires: JSON.stringify(regulatoryTexts),
    references_reglementaires_a_venir: JSON.stringify(upcomingRegulation || ''),
    fishing_period: JSON.stringify(fishingPeriod || '')
  }
}

export const getRegulatoryFeatureId = (id) => {
  return `${Layers.REGULATORY.code}_write.${id}`
}

export const emptyRegulatoryFeatureObject = {
  layer_name: null,
  law_type: null,
  zones: null,
  region: null,
  references_reglementaires: null,
  references_reglementaires_a_venir: null
}

export const FRANCE = 'Réglementation France'
export const UE = 'Réglementation UE'
export const REG_LOCALE = 'Reg locale'

const REG_MED = 'Reg. MED'
const REG_SA = 'Reg. SA'
const REG_NAMO = 'Reg. NAMO'
const REG_MEMN = 'Reg. MEMN'
const REG_OUTRE_MER = 'Reg. Outre-mer'
const RUE_2019 = 'R(UE) 2019/1241'
const RUE_1380 = 'R(UE) 1380/2013'
const RUE_494 = 'R(CE) 494/2002'
const RUE_2019_OLD = 'R(UE) 2019/1241'
const RUE_1380_OLD = 'R(UE) 1380/2013'
const RUE_494_OLD = 'R(CE) 494/2002'

export const LAWTYPES_TO_TERRITORY = {
  [REG_MED]: FRANCE,
  [REG_SA]: FRANCE,
  [REG_NAMO]: FRANCE,
  [REG_MEMN]: FRANCE,
  [REG_OUTRE_MER]: FRANCE,
  [REG_LOCALE]: FRANCE,
  [RUE_2019]: UE,
  [RUE_1380]: UE,
  [RUE_494]: UE,
  [RUE_2019_OLD]: UE,
  [RUE_1380_OLD]: UE,
  [RUE_494_OLD]: UE
}

export const REGULATORY_TERRITORY = {
  [FRANCE]: 'Réglementation France',
  [UE]: 'Réglementation UE'
}

export const REGULATORY_SEARCH_PROPERTIES = {
  TOPIC: 'topic',
  ZONE: 'zone',
  REGION: 'region',
  GEARS: 'gears',
  SPECIES: 'species',
  REGULATORY_REFERENCES: 'regulatoryReferences'
}

/**
  * @readonly
  * @enum {string}
*/
export const REGULATION_ACTION_TYPE = {
  UPDATE: 'update',
  INSERT: 'insert',
  DELETE: 'delete'
}

/**
  * @readonly
  * @enum {RegulatoryTextSource}
*/
export const REGULATORY_TEXT_SOURCE = {
  UPCOMING_REGULATION: 'upcomingRegulation',
  REGULATION: 'regulation'
}

export const DEFAULT_REGULATORY_TEXT = {
  url: '',
  reference: '',
  startDate: new Date().getTime(),
  endDate: undefined,
  textType: []
}

export const DEFAULT_DATE_RANGE = {
  startDate: undefined,
  endDate: undefined
}

export const initialFishingPeriodValues = {
  authorized: undefined,
  annualRecurrence: undefined,
  dateRanges: [],
  dates: [],
  weekdays: [],
  holidays: undefined,
  daytime: undefined,
  timeIntervals: []
}

export const WEEKDAYS = {
  lundi: 'L',
  mardi: 'M',
  mercredi: 'M',
  jeudi: 'J',
  vendredi: 'V',
  samedi: 'S',
  dimanche: 'D'
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

/**
 * Remove the Territory part of the regulatory layer object (see `setRegulatoryLayers` method within the `Regulatory` reducer)
 * @param {Object} layersTopicsByRegTerritory - The regulatory object
 * @return {Object} The regulatory object without Territory
 */
export const getRegulatoryLayersWithoutTerritory = layersTopicsByRegTerritory => {
  let nextRegulatoryLayersWithoutTerritory = {}

  Object.keys(layersTopicsByRegTerritory).forEach(territory => {
    nextRegulatoryLayersWithoutTerritory = {
      ...nextRegulatoryLayersWithoutTerritory,
      ...layersTopicsByRegTerritory[territory]
    }
  })

  return nextRegulatoryLayersWithoutTerritory
}
