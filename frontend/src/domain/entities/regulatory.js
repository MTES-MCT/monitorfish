import {
  getTextForSearch,
  formatDataForSelectPicker
} from '../../utils'
import Layers from './layers'

export const mapToRegulatoryZone = ({ properties, geometry, id }) => {
  return {
    id: properties.id || id?.split('.')[1],
    geometry: geometry,
    lawType: properties.law_type,
    topic: properties.layer_name,
    prohibitedGears: properties.engins_interdits,
    gears: properties.engins,
    zone: decodeURI(properties.zones),
    species: properties.especes,
    prohibitedSpecies: properties.especes_interdites,
    regulatorySpecies: parseRegulatorySpecies(properties.species),
    regulatoryReferences: parseRegulatoryReferences(properties.references_reglementaires),
    upcomingRegulatoryReferences: parseUpcomingRegulatoryReferences(properties.references_reglementaires_a_venir),
    fishingPeriod: parseFishingPeriod(properties.fishing_period),
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

function parseRegulatorySpecies (species) {
  return species
    ? parseJSON(species)
    : initialRegulatorySpeciesValues
}

const parseUpcomingRegulatoryReferences = upcomingRegulatoryReferences =>
  upcomingRegulatoryReferences && upcomingRegulatoryReferences !== {}
    ? parseJSON(upcomingRegulatoryReferences)
    : undefined

const parseRegulatoryReferences = regulatoryTextsString => {
  if (!regulatoryTextsString) {
    return undefined
  }

  const regulatoryTexts = parseJSON(regulatoryTextsString)
  if (regulatoryTexts?.length > 0 && Array.isArray(regulatoryTexts)) {
    return regulatoryTexts.map(regulatoryText => {
      if (!regulatoryText.startDate || regulatoryText.startDate === '') {
        regulatoryText.startDate = new Date().getTime()
      }

      return regulatoryText
    })
  }

  return undefined
}

const parseJSON = text => typeof text === 'string'
  ? JSON.parse(text)
  : text

export const parseFishingPeriod = fishingPeriod => {
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
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    })

    const newDates = dates?.map(date => {
      return date ? new Date(date) : undefined
    })

    const newTimeIntervals = timeIntervals?.map(({ from, to }) => {
      return {
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined
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
  }

  return initialFishingPeriodValues
}

export const mapToRegulatoryFeatureObject = properties => {
  const {
    layerName,
    lawType,
    zone,
    region,
    regulatoryReferences,
    upcomingRegulatoryReferences,
    fishingPeriod,
    regulatorySpecies
  } = properties

  return {
    layer_name: layerName,
    law_type: lawType,
    zones: zone,
    region,
    references_reglementaires: JSON.stringify(regulatoryReferences),
    references_reglementaires_a_venir: JSON.stringify(upcomingRegulatoryReferences),
    fishing_period: JSON.stringify(fishingPeriod),
    species: JSON.stringify(regulatorySpecies)
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

export const LAWTYPES_TO_TERRITORY = {
  [REG_MED]: FRANCE,
  [REG_SA]: FRANCE,
  [REG_NAMO]: FRANCE,
  [REG_MEMN]: FRANCE,
  [REG_OUTRE_MER]: FRANCE,
  [RUE_2019]: UE,
  [RUE_1380]: UE,
  [RUE_494]: UE
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

/** @type {FishingPeriod} */
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

/** @type {RegulatorySpecies} */
export const initialRegulatorySpeciesValues = {
  authorized: undefined,
  allSpecies: undefined,
  otherInfo: undefined,
  species: [],
  speciesGroups: []
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

export const DEFAULT_MENU_CLASSNAME = 'new-regulation-select-picker'

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

const toArrayString = (array) => {
  if (array?.length) {
    if (array.length === 1) {
      return array[0]
    } else if (array.length === 2) {
      return array.join(' et ')
    } else {
      return array.slice(0, -1).join(', ').concat(' et ').concat(array.slice(-1))
    }
  }
}

const dateToString = (date, annualRecurrence) => {
  const options = { day: 'numeric', month: 'long' }
  if (!annualRecurrence) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('fr-FR', options)
}

const getTimesValues = () => {
  const hours = [...Array(24).keys()]
  const times = hours.reduce((acc, hour) => {
    const hourStr = hour < 10 ? '0' + hour : hour
    acc.push(`${hourStr}h00`)
    acc.push(`${hourStr}h30`)
    return acc
  }, [])
  return formatDataForSelectPicker(times)
}

export const TIMES_SELECT_PICKER_VALUES = getTimesValues()

const timeToString = (date) => {
  const minutes = date.getMinutes()
  const hours = date.getHours()
  return `${hours < 10 ? '0' : ''}${hours}h${minutes < 10 ? '0' : ''}${minutes}`
}

export const convertTimeToString = (date) => {
  if (date) {
    const minutes = date.getMinutes()
    const hours = date.getHours()
    return `${hours < 10 ? '0' + hours : hours}h${minutes === 0 ? minutes + '0' : minutes}`
  }
}

export const fishingPeriodToString = fishingPeriod => {
  const {
    dateRanges,
    annualRecurrence,
    dates,
    weekdays,
    holidays,
    timeIntervals,
    daytime,
    authorized
  } = fishingPeriod

  const textArray = []
  if (dateRanges?.length) {
    let array = toArrayString(
      dateRanges.map(({ startDate, endDate }) => {
        if (startDate && endDate) {
          return `du ${dateToString(startDate, annualRecurrence)} au ${dateToString(endDate, annualRecurrence)}`
        }

        return undefined
      }).filter(e => e))

    if (array?.length) {
      if (annualRecurrence) {
        array = 'tous les ans '.concat(array)
      }
      textArray.push(array)
    }
  }

  if (dates?.length) {
    const array = toArrayString(dates.map((date) => {
      if (date) {
        return `le ${dateToString(date)}`
      }

      return undefined
    }).filter(e => e))

    if (array?.length) {
      textArray.push(array)
    }
  }

  if (weekdays?.length) {
    textArray.push(`le${weekdays.length > 1 ? 's' : ''} ${toArrayString(weekdays)}`)
  }

  if (holidays) {
    textArray.push('les jours fériés')
  }

  if (timeIntervals?.length) {
    const array = toArrayString(timeIntervals.map(({ from, to }) => {
      if (from && to) {
        return `de ${timeToString(from)} à ${timeToString(to)}`
      }
      return undefined
    }).filter(e => e))

    if (array?.length) {
      textArray.push(array)
    }
  } else if (daytime) {
    textArray.push('du lever au coucher du soleil')
  }

  if (textArray?.length) {
    return `Pêche ${authorized ? 'autorisée' : 'interdite'} `.concat(textArray.join(', '))
  }

  return null
}

export const sortLayersTopicsByRegTerritory = (layersTopicsByRegTerritory) => {
  const UEObject = { ...layersTopicsByRegTerritory[UE] }

  const FRObject = { ...layersTopicsByRegTerritory[FRANCE] }
  const newFRObject = {
    [REG_MEMN]: FRObject[REG_MEMN],
    [REG_NAMO]: FRObject[REG_NAMO],
    [REG_SA]: FRObject[REG_SA],
    [REG_MED]: FRObject[REG_MED],
    [REG_OUTRE_MER]: FRObject[REG_OUTRE_MER]
  }

  return {
    [UE]: UEObject.sort(),
    [FRANCE]: newFRObject
  }
}
