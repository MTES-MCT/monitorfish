import { formatDataForSelectPicker, getTextForSearch } from '../../utils'
import { Layer } from './layers/constants'

export const mapToRegulatoryZone = ({ properties, geometry, id }, speciesByCode) => {
  return {
    id: properties.id || id?.split('.')[1],
    geometry: geometry,
    lawType: properties.law_type,
    topic: properties.topic,
    zone: decodeURI(properties.zone),
    gearRegulation: parseGearRegulation(properties.gears),
    speciesRegulation: parseSpeciesRegulation(properties.species, speciesByCode),
    regulatoryReferences: parseRegulatoryReferences(properties.regulatory_references),
    fishingPeriod: parseFishingPeriod(properties.fishing_period),
    region: properties.region,
    otherInfo: properties.other_info,
    nextId: properties.next_id
  }
}

export const mapToProcessingRegulation = persistProcessingRegulation => {
  if (persistProcessingRegulation) {
    const _parsedFishingPeriod = mapToFishingPeriod(persistProcessingRegulation.fishingPeriod)
    return {
      ...persistProcessingRegulation,
      fishingPeriod: _parsedFishingPeriod
    }
  }
  return DEFAULT_REGULATION
}

function parseGearRegulation (gears) {
  return gears
    ? parseJSON(gears)
    : DEFAULT_GEAR_REGULATION
}

/**
 * Parse the JSON and adds the species name to the list of species
 * @param speciesRegulation
 * @param {Object<string, {name: string, code: string}>} speciesByCode
 * @return {{otherInfo?: string, species: *, allSpecies?: boolean, speciesGroups?: string[]}}
 */
function parseSpeciesRegulation (speciesRegulation, speciesByCode) {
  const nextSpeciesRegulation = speciesRegulation
    ? parseJSON(speciesRegulation)
    : DEFAULT_SPECIES_REGULATION

  if (nextSpeciesRegulation?.authorized?.species?.length) {
    nextSpeciesRegulation.authorized.species = addMissingSpeciesName(nextSpeciesRegulation?.authorized?.species, speciesByCode)
  }

  if (nextSpeciesRegulation?.unauthorized?.species?.length) {
    nextSpeciesRegulation.unauthorized.species = addMissingSpeciesName(nextSpeciesRegulation?.unauthorized?.species, speciesByCode)
  }

  return nextSpeciesRegulation
}

function addMissingSpeciesName (species, speciesByCode) {
  return species.map(uniqueSpecies => {
    if (!uniqueSpecies?.name) {
      uniqueSpecies.name = speciesByCode[uniqueSpecies.code]?.name
    }

    return uniqueSpecies
  })
}

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
    return mapToFishingPeriod(JSON.parse(fishingPeriod))
  }
  return DEFAULT_FISHING_PERIOD_VALUES
}

const mapToFishingPeriod = fishingPeriod => {
  if (fishingPeriod) {
    const {
      dateRanges,
      dates,
      timeIntervals
    } = fishingPeriod
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
      ...fishingPeriod,
      dateRanges: newDateRanges,
      dates: newDates,
      timeIntervals: newTimeIntervals
    }
  }
  return DEFAULT_FISHING_PERIOD_VALUES
}

export const mapToRegulatoryFeatureObject = properties => {
  const {
    topic,
    lawType,
    zone,
    region,
    regulatoryReferences,
    fishingPeriod,
    speciesRegulation,
    gearRegulation,
    otherInfo,
    nextId
  } = properties

  return {
    topic: topic,
    law_type: lawType,
    zone: zone,
    region: region,
    regulatory_references: JSON.stringify(regulatoryReferences),
    fishing_period: JSON.stringify(fishingPeriod),
    species: JSON.stringify(speciesRegulation),
    gears: JSON.stringify(gearRegulation),
    other_info: otherInfo,
    next_id: nextId
  }
}

export const getRegulatoryFeatureId = (id) => {
  return `${Layer.REGULATORY.code}_write.${id}`
}

export const emptyRegulatoryFeatureObject = {
  topic: null,
  law_type: null,
  zone: null,
  region: null,
  regulatory_references: null,
  next_id: null
}

export const FRANCE = 'Réglementation France'
export const UE = 'Réglementation UE'
export const UK = 'Réglementation UK'
export const REG_LOCALE = 'Reg locale'
export const ORGP = 'Réglementation ORGP'

const REG_RTC = 'Reg. RTC'
const REG_UK = 'Reg. UK'
const REG_MED = 'Reg. MED'
const REG_SA = 'Reg. SA'
const REG_NAMO = 'Reg. NAMO'
const REG_MEMN = 'Reg. MEMN'
const REG_OUTRE_MER = 'Reg. Outre-mer'

const RUE_2019 = 'R(UE) 2019/1241'
const RUE_1380 = 'R(UE) 1380/2013'
const RUE_2022 = 'R(UE) 2022/1614'
const RUE_494 = 'R(CE) 494/2002'
const RUE_2017 = 'R(CE) 2017/118'

const REG_CCAMLR = 'Reg. CCAMLR'
const REG_CTOI_IOTC = 'Reg. CTOI / IOTC'
const REG_ICCAT_CICTA = 'Reg. ICCAT / CICTA'
const REG_NEAFC_CPANE = 'Reg. NEAFC / CPANE'
const REG_OPANO_NAFO = 'Reg. OPANO / NAFO'
const REG_SIOFA_APSOI = 'Reg. SIOFA / APSOI'

export const LAWTYPES_TO_TERRITORY = {
  [REG_MED]: FRANCE,
  [REG_SA]: FRANCE,
  [REG_NAMO]: FRANCE,
  [REG_MEMN]: FRANCE,
  [REG_OUTRE_MER]: FRANCE,
  [RUE_2019]: UE,
  [RUE_1380]: UE,
  [RUE_494]: UE,
  [RUE_2017]: UE,
  [RUE_2022]: UE,
  [REG_RTC]: UE,
  [REG_UK]: UK,
  [REG_CCAMLR]: ORGP,
  [REG_CTOI_IOTC]: ORGP,
  [REG_ICCAT_CICTA]: ORGP,
  [REG_NEAFC_CPANE]: ORGP,
  [REG_OPANO_NAFO]: ORGP,
  [REG_SIOFA_APSOI]: ORGP
}

export const REGULATORY_SEARCH_PROPERTIES = {
  TOPIC: 'topic',
  ZONE: 'zone',
  REGION: 'region',
  LAW_TYPE: 'law_type',
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
* @enum {RegulatoryTextType}
*/
export const REGULATORY_TEXT_TYPE = {
  CREATION: 'creation',
  REGULATION: 'regulation'
}

const regulatoryZoneTextType = type =>
  type === REGULATORY_TEXT_TYPE.CREATION ? 'création' : REGULATORY_TEXT_TYPE.REGULATION ? 'réglementation' : undefined

export const getRegulatoryZoneTextTypeAsText = (textTypeList) => {
  return `${textTypeList.length === 2
  ? `${regulatoryZoneTextType(textTypeList[0])} et ${regulatoryZoneTextType(textTypeList[1])}`
  : `${regulatoryZoneTextType(textTypeList[0])}`} de zone`
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
const DEFAULT_FISHING_PERIOD_VALUES = {
  authorized: undefined,
  annualRecurrence: undefined,
  dateRanges: [],
  dates: [],
  weekdays: [],
  holidays: undefined,
  daytime: undefined,
  timeIntervals: [],
  always: undefined
}

/** @type {RegulatedSpecies} */
export const DEFAULT_AUTHORIZED_REGULATED_SPECIES = {
  otherInfo: undefined,
  species: [],
  speciesGroups: []
}

/** @type {RegulatedSpecies} */
export const DEFAULT_UNAUTHORIZED_REGULATED_SPECIES = {
  allSpecies: undefined,
  otherInfo: undefined,
  species: [],
  speciesGroups: []
}

/** @type {SpeciesRegulation} */
export const DEFAULT_SPECIES_REGULATION = {
  authorized: DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  unauthorized: DEFAULT_UNAUTHORIZED_REGULATED_SPECIES,
  otherInfo: undefined
}

/** @type {RegulatedGears} */
export const DEFAULT_AUTHORIZED_REGULATED_GEARS = {
  allTowedGears: null,
  allPassiveGears: null,
  regulatedGearCategories: {},
  regulatedGears: {},
  selectedCategoriesAndGears: [],
  derogation: null
}

/** @type {RegulatedGears} */
export const DEFAULT_UNAUTHORIZED_REGULATED_GEARS = {
  allGears: null,
  allTowedGears: null,
  allPassiveGears: null,
  regulatedGearCategories: {},
  regulatedGears: {},
  selectedCategoriesAndGears: [],
  derogation: null
}

/** @type {GearRegulation} */
export const DEFAULT_GEAR_REGULATION = {
  authorized: DEFAULT_AUTHORIZED_REGULATED_GEARS,
  unauthorized: DEFAULT_UNAUTHORIZED_REGULATED_GEARS,
  otherInfo: undefined
}

export const REGULATORY_REFERENCE_KEYS = {
  ID: 'id',
  REGION: 'region',
  LAW_TYPE: 'lawType',
  TOPIC: 'topic',
  ZONE: 'zone',
  REGULATORY_REFERENCES: 'regulatoryReferences',
  FISHING_PERIOD: 'fishingPeriod',
  SPECIES_REGULATION: 'speciesRegulation',
  GEAR_REGULATION: 'gearRegulation',
  OTHER_INFO: 'otherInfo'
}

export const DEFAULT_REGULATION = {
  [REGULATORY_REFERENCE_KEYS.REGULATORY_REFERENCES]: [DEFAULT_REGULATORY_TEXT],
  [REGULATORY_REFERENCE_KEYS.FISHING_PERIOD]: DEFAULT_FISHING_PERIOD_VALUES,
  [REGULATORY_REFERENCE_KEYS.SPECIES_REGULATION]: DEFAULT_SPECIES_REGULATION,
  [REGULATORY_REFERENCE_KEYS.GEAR_REGULATION]: DEFAULT_GEAR_REGULATION,
  [REGULATORY_REFERENCE_KEYS.OTHER_INFO]: null
}

export const GEARS_CATEGORIES_WITH_MESH = [
  'Chaluts',
  'Sennes traînantes',
  'Filets tournants',
  'Filets soulevés',
  'Filets maillants et filets emmêlants'
]

export const INITIAL_UPCOMING_REG_REFERENCE = { regulatoryTextList: [DEFAULT_REGULATORY_TEXT] }

export const FISHING_PERIOD_KEYS = {
  DATE_RANGES: 'dateRanges',
  DATES: 'dates',
  TIME_INTERVALS: 'timeIntervals',
  AUTHORIZED: 'authorized',
  ANNUAL_RECURRENCE: 'annualRecurrence',
  WEEKDAYS: 'weekdays',
  HOLIDAYS: 'holidays',
  DAYTIME: 'daytime',
  ALWAYS: 'always'
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
// We must keep this order as dayjs use this order with digits of range [0, 6]
export const WEEKDAYS = {
  dimanche: 'D',
  lundi: 'L',
  mardi: 'M',
  mercredi: 'M',
  jeudi: 'J',
  vendredi: 'V',
  samedi: 'S'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */

export const DEFAULT_MENU_CLASSNAME = 'new-regulation-select-picker'

export function findIfSearchStringIncludedInProperty (zone, propertiesToSearch, searchText) {
  return zone[propertiesToSearch] && searchText
    ? getTextForSearch(zone[propertiesToSearch]).includes(getTextForSearch(searchText))
    : false
}

export function findIfSearchStringIncludedInRegulatoryReferences (zone, searchText) {
  return zone[REGULATORY_SEARCH_PROPERTIES.REGULATORY_REFERENCES]?.length && searchText
    ? zone[REGULATORY_SEARCH_PROPERTIES.REGULATORY_REFERENCES].find(text => text?.reference.toString().includes(searchText))
    : false
}

export function searchByLawType (lawTypes, properties, searchText, gears, species) {
  const searchResultByLawType = {}

  Object.keys(lawTypes).forEach(lawType => {
    const regulatoryZone = Object.assign({}, lawTypes[lawType])
    const foundRegulatoryZones = search(searchText, properties, regulatoryZone, gears, species)

    if (foundRegulatoryZones && Object.keys(foundRegulatoryZones).length !== 0) {
      searchResultByLawType[lawType] = foundRegulatoryZones
    }
  })

  return searchResultByLawType
}

export function searchResultIncludeZone (searchResult, { lawType, topic, zone }) {
  const territorySearchResult = searchResult[LAWTYPES_TO_TERRITORY[lawType]]
  if (territorySearchResult) {
    return Object.keys(territorySearchResult).includes(lawType) &&
      Object.keys(territorySearchResult[lawType]).includes(topic) &&
      territorySearchResult[lawType][topic].filter(regulatoryZone => regulatoryZone.zone === zone).length > 0
  }
  return false
}

export function findIfStringIsIncludedInZoneGears (zone, searchText, uniqueGearCodes) {
  const gearCodes = zone.regulatedGears?.regulatedGears
    ? Object.keys(zone.regulatedGears?.regulatedGears)
    : []

  if (gearCodes?.length) {
    return gearCodeIsFoundInRegulatoryZone(gearCodes, uniqueGearCodes)
  } else {
    return false
  }
}

export function findIfStringIsIncludedInZoneSpecies (zone, searchText, uniqueGearCodes) {
  const speciesCodes = zone.speciesRegulation?.authorized?.species?.map(speciesCodes => speciesCodes.code)

  if (speciesCodes?.length) {
    return gearCodeIsFoundInRegulatoryZone(speciesCodes, uniqueGearCodes)
  } else {
    return false
  }
}

export function search (searchText, propertiesToSearch, regulatoryZones, gears, species) {
  if (regulatoryZones) {
    const foundRegulatoryZones = { ...regulatoryZones }

    let uniqueGearCodes = null
    if (propertiesToSearch.includes(REGULATORY_SEARCH_PROPERTIES.GEARS)) {
      uniqueGearCodes = getUniqueGearCodesFromSearch(searchText, gears)
    }
    let uniqueSpeciesCodes = null
    if (propertiesToSearch.includes(REGULATORY_SEARCH_PROPERTIES.SPECIES)) {
      uniqueSpeciesCodes = getUniqueSpeciesCodesFromSearch(searchText, species)
    }

    Object.keys(foundRegulatoryZones)
      .forEach(key => {
        foundRegulatoryZones[key] = foundRegulatoryZones[key]
          .filter(zone => {
            let searchStringIncludedInProperty = false
            propertiesToSearch.forEach(property => {
              if (property === REGULATORY_SEARCH_PROPERTIES.GEARS) {
                searchStringIncludedInProperty = findIfStringIsIncludedInZoneGears(zone, searchText, uniqueGearCodes)
              } else if (property === REGULATORY_SEARCH_PROPERTIES.SPECIES) {
                searchStringIncludedInProperty = findIfStringIsIncludedInZoneSpecies(zone, searchText, uniqueSpeciesCodes)
              } else if (property === REGULATORY_SEARCH_PROPERTIES.REGULATORY_REFERENCES) {
                searchStringIncludedInProperty =
                  searchStringIncludedInProperty || findIfSearchStringIncludedInRegulatoryReferences(zone, searchText)
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

  return {}
}

export function getUniqueGearCodesFromSearch (searchText, gears) {
  const foundGearCodes = gears
    .filter(gear => gear.name.toLowerCase().includes(searchText.toLowerCase()) || gear.code.toLowerCase().includes(searchText.toLowerCase()))
    .map(gear => gear.code)
  return [...new Set(foundGearCodes)]
}

export function getUniqueSpeciesCodesFromSearch (searchText, species) {
  const foundSpeciesCodes = species
    .filter(species => species.name.toLowerCase().includes(searchText.toLowerCase()) || species.code.toLowerCase().includes(searchText.toLowerCase()))
    .map(gear => gear.code)
  return [...new Set(foundSpeciesCodes)]
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

/**
 * Convert an array of word to a sentence.
 * Each word or separated with a coma,
 * exept the second last word is fellowed by 'et'
 * and the last word with nothing
 * @param {string[]} array
 * @returns {string}
 */
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
  return null
}

/**
 * dateToString
 * Convert date to string
 * if annualRecurrence, the year is added, then nothing
 * @param {Date} date
 * @param {boolean} annualRecurrence
 * @returns
 */
const dateToString = (date, annualRecurrence) => {
  const options = { day: 'numeric', month: 'long' }
  if (!annualRecurrence) {
    options.year = 'numeric'
  }
  return date.toLocaleDateString('fr-FR', options)
}

const getHoursValues = () => {
  const hours = [...Array(24).keys()]
  const times = hours.reduce((acc, hour) => {
    const hourStr = hour < 10 ? '0' + hour : hour
    acc.push(`${hourStr}h00`)
    acc.push(`${hourStr}h30`)
    return acc
  }, [])
  return formatDataForSelectPicker(times)
}

export const TIMES_SELECT_PICKER_VALUES = getHoursValues()

/**
 * timeToString
 * Convert date time to string
 * 0 is added in front of number lesser than 10
 * @param {Date} date
 * @returns {string} date as string
 */
export const convertTimeToString = (date) => {
  if (date) {
    const minutes = date.getMinutes()
    const hours = date.getHours()
    return `${hours < 10 ? '0' + hours : hours}h${minutes === 0 ? minutes + '0' : minutes}`
  }
  return null
}

/**
 * fishingPeriodToString
 * Convert a fishing period object to a sentence understandable by a human
 * @param {FishingPeriod} fishingPeriod
 * @returns {string} - fishing period convert to string
 */
export const fishingPeriodToString = fishingPeriod => {
  if (!fishingPeriod) {
    return ''
  }

  const {
    dateRanges,
    annualRecurrence,
    dates,
    weekdays,
    holidays,
    timeIntervals,
    daytime,
    authorized,
    always
  } = fishingPeriod

  const textArray = []
  if (always) {
    textArray.push('en tous temps')
  }

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
        return `de ${convertTimeToString(from)} à ${convertTimeToString(to)}`
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

/**
 * sortLayersTopicsByRegTerritory
 * Sort the layer topics group by regulatory territory
 * respecting a particular order.
 * @param {Map<string, RegulatoryTopics} layersTopicsByRegTerritory
 * @returns {Map<string, RegulatoryTopics}
 */
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

export const getTitle = regulatory => regulatory
  ? regulatory.zone
  : ''

/**
 * @function checkUrl
 * @param {String} url
 * @returns true if the url parameter is a correct url, else false
 */
export const checkURL = (url) => {
  const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
  return regex.test(url)
}
