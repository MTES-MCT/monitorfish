import { LayerProperties } from '../../domain/entities/layers/constants'
import { getTextForSearch } from '../../utils'
import { isNotNullish } from '../../utils/isNotNullish'
import { formatDataForSelectPicker } from '../BackOffice/utils'

import type { Regulation } from './Regulation.types'
import type {
  FishingPeriod,
  Gear,
  GearRegulation,
  RegulatedGears,
  RegulatedSpecies,
  RegulatoryLawTypes,
  RegulatoryZone,
  SpeciesRegulation,
  RegulatoryText,
  DateInterval,
  RegulatoryZoneDraft
} from './types'
import type { Specy } from '../../domain/types/specy'

// TODO Create a custom `GeoJSON.Feature` type to represent these properties.
export const mapToRegulatoryZone = (
  feature: Regulation.RegulatoryZoneGeoJsonFeature,
  speciesByCode: Record<string, Specy>
): RegulatoryZone | undefined => {
  if (!feature.geometry || !feature.properties) {
    return undefined
  }

  return {
    fishingPeriod: parseFishingPeriod(feature.properties.fishing_period),
    gearRegulation: parseGearRegulation(feature.properties.gears),
    geometry: feature.geometry,
    id: feature.properties.id ?? feature.id?.split('.')[1],
    lawType: feature.properties.law_type,
    nextId: feature.properties.next_id,
    otherInfo: feature.properties.other_info,
    region: feature.properties.region,
    regulatoryReferences: parseRegulatoryReferences(feature.properties.regulatory_references),
    speciesRegulation: parseSpeciesRegulation(feature.properties.species, speciesByCode),
    topic: feature.properties.topic,
    zone: decodeURI(feature.properties.zone)
  }
}

export const mapToProcessingRegulation = (persistProcessingRegulation: RegulatoryZoneDraft) => {
  if (persistProcessingRegulation) {
    const fishingPeriod = mapToFishingPeriod(persistProcessingRegulation.fishingPeriod)

    return {
      ...persistProcessingRegulation,
      fishingPeriod
    }
  }

  return DEFAULT_REGULATION
}

export const getRegulatoryLawTypesFromZones = (regulatoryZones: RegulatoryZone[]): RegulatoryLawTypes => {
  const lawTypes: string[] = regulatoryZones.map(regulatoryZone => regulatoryZone.lawType).filter(lawType => lawType)
  const uniqueLawTypes = Array.from(new Set(lawTypes))

  return uniqueLawTypes.reduce((lawTypeAccumulator, lawType) => {
    const uniqueLawTypeTopics = getLawTypeTopics(regulatoryZones, lawType)

    // eslint-disable-next-line no-param-reassign
    lawTypeAccumulator[lawType] = getTopicsToZones(uniqueLawTypeTopics, regulatoryZones)

    return lawTypeAccumulator
  }, {})
}

function getLawTypeTopics(regulatoryZones: RegulatoryZone[], lawType: string) {
  const lawTypeTopics: string[] = regulatoryZones
    .filter(regulatoryZone => regulatoryZone.lawType === lawType)
    .map(regulatoryZone => regulatoryZone.topic)

  return Array.from(new Set(lawTypeTopics))
}

function getTopicsToZones(uniqueLawTypeTopics: string[], regulatoryZones: RegulatoryZone[]) {
  return uniqueLawTypeTopics.reduce((topicAccumulator, topic) => {
    // eslint-disable-next-line no-param-reassign
    topicAccumulator[topic] = regulatoryZones.filter(regulatoryZone => regulatoryZone.topic === topic)

    return topicAccumulator
  }, {})
}

function parseGearRegulation(gears): GearRegulation {
  return gears ? parseJSON(gears) : DEFAULT_GEAR_REGULATION
}

/**
 * Parse the JSON and adds the species name to the list of species
 */
function parseSpeciesRegulation(
  speciesRegulation: string | undefined,
  speciesByCode: Record<string, Specy>
): SpeciesRegulation {
  const nextSpeciesRegulation = speciesRegulation ? parseJSON(speciesRegulation) : DEFAULT_SPECIES_REGULATION

  if (nextSpeciesRegulation?.authorized?.species?.length) {
    nextSpeciesRegulation.authorized.species = addMissingSpeciesName(
      nextSpeciesRegulation?.authorized?.species,
      speciesByCode
    )
  }

  if (nextSpeciesRegulation?.unauthorized?.species?.length) {
    nextSpeciesRegulation.unauthorized.species = addMissingSpeciesName(
      nextSpeciesRegulation?.unauthorized?.species,
      speciesByCode
    )
  }

  return nextSpeciesRegulation
}

function addMissingSpeciesName(species: Specy[], speciesByCode: Record<string, Specy>) {
  return species.map(specy => ({
    ...specy,
    name: !specy?.name ? speciesByCode[specy.code]?.name : specy.name
  }))
}

const parseRegulatoryReferences = (regulatoryTextsString: string | undefined): RegulatoryText[] | undefined => {
  if (!regulatoryTextsString) {
    return undefined
  }

  const regulatoryTexts = parseJSON(regulatoryTextsString)
  if (regulatoryTexts?.length > 0 && Array.isArray(regulatoryTexts)) {
    return regulatoryTexts.map(regulatoryText => ({
      ...regulatoryText,
      startDate:
        !regulatoryText.startDate || regulatoryText.startDate === '' ? new Date().getTime() : regulatoryText.startDate
    }))
  }

  return undefined
}

const parseJSON = text => (typeof text === 'string' ? JSON.parse(text) : text)

export const parseFishingPeriod = (fishingPeriodAsString: string | undefined) => {
  if (fishingPeriodAsString) {
    return mapToFishingPeriod(JSON.parse(fishingPeriodAsString) as FishingPeriod<string>)
  }

  return DEFAULT_FISHING_PERIOD_VALUES
}

const mapToFishingPeriod = (fishingPeriod: FishingPeriod<string | Date> | undefined): FishingPeriod<Date> => {
  if (fishingPeriod) {
    const { dateRanges, dates, timeIntervals } = fishingPeriod
    const newDateRanges = dateRanges?.map(({ endDate, startDate }) => ({
      endDate: endDate ? new Date(endDate) : undefined,
      startDate: startDate ? new Date(startDate) : undefined
    }))

    const newDates = dates.map(date => (date ? new Date(date) : undefined)).filter(isNotNullish)

    const newTimeIntervals = timeIntervals?.map(({ from, to }) => ({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined
    }))

    return {
      ...fishingPeriod,
      dateRanges: newDateRanges,
      dates: newDates,
      timeIntervals: newTimeIntervals
    }
  }

  return DEFAULT_FISHING_PERIOD_VALUES
}

// TODO Type these `any`.
export const mapToRegulatoryFeatureObject = ({
  fishingPeriod,
  gearRegulation,
  lawType,
  nextId,
  otherInfo,
  region,
  regulatoryReferences,
  speciesRegulation,
  topic,
  zone
}: {
  fishingPeriod: any
  gearRegulation: any
  lawType: string | undefined
  nextId: string | undefined
  otherInfo: string | undefined
  region: string | undefined
  regulatoryReferences: any
  speciesRegulation: any
  topic: string | undefined
  zone: string | undefined
}) => ({
  fishing_period: JSON.stringify(fishingPeriod),
  gears: JSON.stringify(gearRegulation),
  law_type: lawType,
  next_id: nextId,
  other_info: otherInfo,
  region,
  regulatory_references: JSON.stringify(regulatoryReferences),
  species: JSON.stringify(speciesRegulation),
  topic,
  zone
})

export const getRegulatoryFeatureId = id => `${LayerProperties.REGULATORY.code}_write.${id}`

export const emptyRegulatoryFeatureObject: Regulation.RegulatoryFeatureObject = {
  law_type: undefined,
  next_id: undefined,
  region: undefined,
  regulatory_references: undefined,
  topic: undefined,
  zone: undefined
}

export const FRANCE = 'Réglementation France'
export const UE = 'Réglementation UE'
export const UK = 'Réglementation UK'
export const REG_LOCALE = 'Reg locale'
export const ORGP = 'Réglementation ORGP'

// TODO Convert this to an enum.
const REG_RTC = 'Reg. RTC'
const REG_UK = 'Reg. UK'
const REG_MED = 'Reg. MED'
const REG_SA = 'Reg. SA'
const REG_NAMO = 'Reg. NAMO'
const REG_MEMN = 'Reg. MEMN'
const REG_OUTRE_MER = 'Reg. Outre-mer'
const REG_CCAMLR = 'Reg. CCAMLR'
const REG_CTOI_IOTC = 'Reg. CTOI / IOTC'
const REG_ICCAT_CICTA = 'Reg. ICCAT / CICTA'
const REG_NEAFC_CPANE = 'Reg. NEAFC / CPANE'
const REG_OPANO_NAFO = 'Reg. OPANO / NAFO'
const REG_SIOFA_APSOI = 'Reg. SIOFA / APSOI'
const RUE_2019 = 'R(UE) 2019/1241'
const RUE_1380 = 'R(UE) 1380/2013'
const RUE_2022 = 'R(UE) 2022/1614'
const RUE_2024 = 'R(UE) 2024/2594'
const RUE_494 = 'R(CE) 494/2002'
const RUE_2017 = 'R(CE) 2017/118'

// TODO Convert this to an enum mapped type.
export const LAWTYPES_TO_TERRITORY = {
  [REG_CCAMLR]: ORGP,
  [REG_CTOI_IOTC]: ORGP,
  [REG_ICCAT_CICTA]: ORGP,
  [REG_MED]: FRANCE,
  [REG_MEMN]: FRANCE,
  [REG_NAMO]: FRANCE,
  [REG_NEAFC_CPANE]: ORGP,
  [REG_OPANO_NAFO]: ORGP,
  [REG_OUTRE_MER]: FRANCE,
  [REG_RTC]: UE,
  [REG_SA]: FRANCE,
  [REG_SIOFA_APSOI]: ORGP,
  [REG_UK]: UK,
  [RUE_1380]: UE,
  [RUE_2017]: UE,
  [RUE_2019]: UE,
  [RUE_2022]: UE,
  [RUE_2024]: UE,
  [RUE_494]: UE
}

export enum RegulatorySearchProperty {
  GEARS = 'gears',
  REGION = 'region',
  REGULATORY_REFERENCES = 'regulatoryReferences',
  SPECIES = 'species',
  TOPIC = 'topic',
  ZONE = 'zone'
}

// TODO Fix casing.
export enum RegulationActionType {
  Delete = 'delete',
  Insert = 'insert',
  Update = 'update'
}

export enum RegulatoryTextType {
  Creation = 'creation',
  Regulation = 'regulation'
}

const regulatoryZoneTextType = (type: RegulatoryTextType) =>
  type === RegulatoryTextType.Creation ? 'Création' : 'Réglementation'

export const getRegulatoryZoneTextTypeAsText = textTypeList =>
  `${
    textTypeList.length === 2
      ? `${regulatoryZoneTextType(textTypeList[0])} et ${regulatoryZoneTextType(textTypeList[1])}`
      : `${regulatoryZoneTextType(textTypeList[0])}`
  } de zone`

export const DEFAULT_REGULATORY_TEXT: RegulatoryText = {
  endDate: undefined,
  reference: '',
  startDate: new Date(),
  textType: [],
  url: ''
}

export const DEFAULT_DATE_RANGE: DateInterval = {
  endDate: undefined,
  startDate: undefined
}

const DEFAULT_FISHING_PERIOD_VALUES: FishingPeriod<Date> = {
  always: undefined,
  annualRecurrence: undefined,
  authorized: undefined,
  dateRanges: [],
  dates: [],
  daytime: undefined,
  holidays: undefined,
  otherInfo: undefined,
  timeIntervals: [],
  weekdays: []
}

export const DEFAULT_AUTHORIZED_REGULATED_SPECIES: RegulatedSpecies = {
  allSpecies: undefined,
  otherInfo: undefined,
  species: [],
  speciesGroups: []
}

export const DEFAULT_UNAUTHORIZED_REGULATED_SPECIES: RegulatedSpecies = {
  allSpecies: undefined,
  otherInfo: undefined,
  species: [],
  speciesGroups: []
}

export const DEFAULT_SPECIES_REGULATION: SpeciesRegulation = {
  authorized: DEFAULT_AUTHORIZED_REGULATED_SPECIES,
  otherInfo: undefined,
  unauthorized: DEFAULT_UNAUTHORIZED_REGULATED_SPECIES
}

export const DEFAULT_AUTHORIZED_REGULATED_GEARS: RegulatedGears = {
  allGears: undefined,
  allPassiveGears: undefined,
  allTowedGears: undefined,
  derogation: undefined,
  otherInfo: undefined,
  regulatedGearCategories: {},
  regulatedGears: {},
  selectedCategoriesAndGears: []
}

export const DEFAULT_UNAUTHORIZED_REGULATED_GEARS: RegulatedGears = {
  allGears: undefined,
  allPassiveGears: undefined,
  allTowedGears: undefined,
  derogation: undefined,
  otherInfo: undefined,
  regulatedGearCategories: {},
  regulatedGears: {},
  selectedCategoriesAndGears: []
}

export const DEFAULT_GEAR_REGULATION: GearRegulation = {
  authorized: DEFAULT_AUTHORIZED_REGULATED_GEARS,
  otherInfo: undefined,
  unauthorized: DEFAULT_UNAUTHORIZED_REGULATED_GEARS
}

// TODO Get rid of that constant and use `keyof` instead where needed.
export const REGULATORY_REFERENCE_KEYS = {
  FISHING_PERIOD: 'fishingPeriod',
  GEAR_REGULATION: 'gearRegulation',
  ID: 'id',
  LAW_TYPE: 'lawType',
  OTHER_INFO: 'otherInfo',
  REGION: 'region',
  REGULATORY_REFERENCES: 'regulatoryReferences',
  SPECIES_REGULATION: 'speciesRegulation',
  TOPIC: 'topic',
  ZONE: 'zone'
}

export const DEFAULT_REGULATION: RegulatoryZoneDraft = {
  fishingPeriod: DEFAULT_FISHING_PERIOD_VALUES,
  gearRegulation: DEFAULT_GEAR_REGULATION,
  geometry: undefined,
  id: undefined,
  lawType: undefined,
  nextId: undefined,
  otherInfo: undefined,
  region: undefined,
  regulatoryReferences: undefined,
  speciesRegulation: DEFAULT_SPECIES_REGULATION,
  topic: undefined,
  zone: undefined
}

export const GEARS_CATEGORIES_WITH_MESH = [
  'Chaluts',
  'Sennes traînantes',
  'Filets tournants',
  'Filets soulevés',
  'Filets maillants et filets emmêlants'
]

export enum FishingPeriodKey {
  ALWAYS = 'always',
  ANNUAL_RECURRENCE = 'annualRecurrence',
  AUTHORIZED = 'authorized',
  DATES = 'dates',
  DATE_RANGES = 'dateRanges',
  DAYTIME = 'daytime',
  HOLIDAYS = 'holidays',
  TIME_INTERVALS = 'timeIntervals',
  WEEKDAYS = 'weekdays'
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

export function findIfSearchStringIncludedInProperty(zone, propertiesToSearch, searchText) {
  return zone[propertiesToSearch] && searchText
    ? getTextForSearch(zone[propertiesToSearch]).includes(getTextForSearch(searchText))
    : false
}

export function findIfSearchStringIncludedInRegulatoryReferences(zone, searchText) {
  return zone[RegulatorySearchProperty.REGULATORY_REFERENCES]?.length && searchText
    ? zone[RegulatorySearchProperty.REGULATORY_REFERENCES].find(text => text?.reference.toString().includes(searchText))
    : false
}

export function searchByLawType(lawTypes, properties, searchText, gears, species) {
  const searchResultByLawType = {}

  Object.keys(lawTypes).forEach(lawType => {
    const regulatoryZone = { ...lawTypes[lawType] }
    const foundRegulatoryZones = search(searchText, properties, regulatoryZone, gears, species)

    if (foundRegulatoryZones && Object.keys(foundRegulatoryZones).length !== 0) {
      searchResultByLawType[lawType] = foundRegulatoryZones
    }
  })

  return searchResultByLawType
}

export function searchResultIncludeZone(searchResult, { lawType, topic, zone }) {
  const territorySearchResult = searchResult[LAWTYPES_TO_TERRITORY[lawType]]
  if (territorySearchResult) {
    return (
      Object.keys(territorySearchResult).includes(lawType) &&
      Object.keys(territorySearchResult[lawType]).includes(topic) &&
      territorySearchResult[lawType][topic].filter(regulatoryZone => regulatoryZone.zone === zone).length > 0
    )
  }

  return false
}

export function findIfStringIsIncludedInZoneGears(zone, uniqueGearCodes: string[]) {
  const gearCodes = zone.regulatedGears?.regulatedGears ? Object.keys(zone.regulatedGears?.regulatedGears) : []

  if (gearCodes?.length) {
    return gearCodeIsFoundInRegulatoryZone(gearCodes, uniqueGearCodes)
  }

  return false
}

export function findIfStringIsIncludedInZoneSpecies(zone, uniqueGearCodes: string[]) {
  const speciesCodes = zone.speciesRegulation?.authorized?.species?.map(specy => specy.code)

  if (speciesCodes?.length) {
    return gearCodeIsFoundInRegulatoryZone(speciesCodes, uniqueGearCodes)
  }

  return false
}

// TODO Type thees untyped params.
export function search(
  searchText: string,
  propertiesToSearch: RegulatorySearchProperty[],
  regulatoryZones,
  gears: Gear[],
  species: Specy[]
) {
  if (regulatoryZones) {
    // TODO Type that with real definitions.
    const foundRegulatoryZones: Record<string, Record<string, any>[]> = { ...regulatoryZones }

    const uniqueGearCodes: string[] = propertiesToSearch.includes(RegulatorySearchProperty.GEARS)
      ? getUniqueGearCodesFromSearch(searchText, gears)
      : []
    const uniqueSpeciesCodes: string[] = propertiesToSearch.includes(RegulatorySearchProperty.SPECIES)
      ? getUniqueSpeciesCodesFromSearch(searchText, species)
      : []

    // TODO Avoid using `Object.keys()` which makes typing cumbersome.
    Object.keys(foundRegulatoryZones).forEach(key => {
      foundRegulatoryZones[key] = (foundRegulatoryZones[key] as Record<string, any>[]).filter(zone => {
        let isSearchStringIncludedInProperty = false
        propertiesToSearch.forEach(property => {
          if (property === RegulatorySearchProperty.GEARS) {
            isSearchStringIncludedInProperty = findIfStringIsIncludedInZoneGears(zone, uniqueGearCodes)
          } else if (property === RegulatorySearchProperty.SPECIES) {
            isSearchStringIncludedInProperty = findIfStringIsIncludedInZoneSpecies(zone, uniqueSpeciesCodes)
          } else if (property === RegulatorySearchProperty.REGULATORY_REFERENCES) {
            isSearchStringIncludedInProperty =
              isSearchStringIncludedInProperty || findIfSearchStringIncludedInRegulatoryReferences(zone, searchText)
          } else {
            isSearchStringIncludedInProperty =
              isSearchStringIncludedInProperty || findIfSearchStringIncludedInProperty(zone, property, searchText)
          }
        })

        return isSearchStringIncludedInProperty
      })
      if (!foundRegulatoryZones[key] || !(foundRegulatoryZones[key] as Record<string, any>).length) {
        delete foundRegulatoryZones[key]
      }
    })

    return foundRegulatoryZones
  }

  return {}
}

export function getUniqueGearCodesFromSearch(searchText: string, gears: Gear[]): string[] {
  const foundGearCodes = gears
    .filter(
      gear =>
        gear.name.toLowerCase().includes(searchText.toLowerCase()) ||
        gear.code.toLowerCase().includes(searchText.toLowerCase())
    )
    .map(gear => gear.code)

  return Array.from(new Set(foundGearCodes))
}

export function getUniqueSpeciesCodesFromSearch(searchText: string, species: Specy[]): string[] {
  const foundSpeciesCodes = species
    .filter(
      specy =>
        specy.name.toLowerCase().includes(searchText.toLowerCase()) ||
        specy.code.toLowerCase().includes(searchText.toLowerCase())
    )
    .map(gear => gear.code)

  return Array.from(new Set(foundSpeciesCodes))
}

// TODO `gears` seems to be a strings array here and not a `Gear` array, this should be renamed.
export function gearCodeIsFoundInRegulatoryZone(gears: string[], uniqueGearCodes: string[]) {
  return gears.some(gearCodeFromREG => !!uniqueGearCodes.some(foundGearCode => foundGearCode === gearCodeFromREG))
}

// TODO Refactor that with a clean `toPairs` / `fromPairs` without param reassigning.
export function orderByAlphabeticalLayer(foundRegulatoryLayers) {
  if (foundRegulatoryLayers) {
    Object.keys(foundRegulatoryLayers).forEach(lawType => {
      Object.keys(foundRegulatoryLayers[lawType]).forEach(topic => {
        // eslint-disable-next-line no-param-reassign
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

export function getMergedRegulatoryLayers(previousFoundRegulatoryLayers, nextFoundRegulatoryLayers) {
  const mergedRegulatoryLayers = {}

  Object.keys(previousFoundRegulatoryLayers).forEach(lawType => {
    if (previousFoundRegulatoryLayers[lawType]) {
      Object.keys(previousFoundRegulatoryLayers[lawType]).forEach(regulatoryTopic => {
        previousFoundRegulatoryLayers[lawType][regulatoryTopic].forEach(zone => {
          if (
            nextFoundRegulatoryLayers &&
            nextFoundRegulatoryLayers[lawType] &&
            nextFoundRegulatoryLayers[lawType][regulatoryTopic] &&
            nextFoundRegulatoryLayers[lawType][regulatoryTopic].length &&
            nextFoundRegulatoryLayers[lawType][regulatoryTopic].some(
              searchZone => searchZone.topic === zone.topic && searchZone.zone === zone.zone
            )
          ) {
            if (mergedRegulatoryLayers[lawType] && mergedRegulatoryLayers[lawType][regulatoryTopic]) {
              mergedRegulatoryLayers[lawType][regulatoryTopic] =
                mergedRegulatoryLayers[lawType][regulatoryTopic].concat(zone)
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
 */
export const getRegulatoryLayersWithoutTerritory = (
  layersTopicsByRegTerritory: Record<string, Record<string, Record<string, RegulatoryZone[]>>>
): RegulatoryLawTypes => {
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
 * except the second last word is followed by 'et'
 * and the last word with nothing
 */
export const toArrayString = (array: string[]): string | null => {
  if (array?.length) {
    if (array.length === 1) {
      return array[0] as string
    }
    if (array.length === 2) {
      return array.join(' et ')
    }

    return array
      .slice(0, -1)
      .join(', ')
      .concat(' et ')
      .concat(...array.slice(-1))
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
const dateToString = (date: Date, isYearly: boolean = false) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  if (!isYearly) {
    options.year = 'numeric'
  }

  return date.toLocaleDateString('fr-FR', options)
}

const getHoursValues = () => {
  const hours = [...Array(24).keys()]
  const times = hours.reduce<string[]>((acc, hour) => {
    const hourStr = hour < 10 ? `0${hour}` : hour
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
export const convertTimeToString = date => {
  if (date) {
    const minutes = date.getMinutes()
    const hours = date.getHours()

    return `${hours < 10 ? `0${hours}` : hours}h${minutes === 0 ? `${minutes}0` : minutes}`
  }

  return null
}

/**
 * fishingPeriodToString
 * Convert a fishing period object to a sentence understandable by a human
 * @param {FishingPeriod} fishingPeriod
 * @returns {string} - fishing period convert to string
 */
export const fishingPeriodToString = (fishingPeriod): string | undefined => {
  if (!fishingPeriod) {
    return ''
  }

  const { always, annualRecurrence, authorized, dateRanges, dates, daytime, holidays, timeIntervals, weekdays } =
    fishingPeriod

  const textArray: string[] = []
  if (always) {
    textArray.push('en tous temps')
  }

  if (dateRanges?.length) {
    let array = toArrayString(
      dateRanges
        .map(({ endDate, startDate }) => {
          if (startDate && endDate) {
            return `du ${dateToString(startDate, annualRecurrence)} au ${dateToString(endDate, annualRecurrence)}`
          }

          return undefined
        })
        .filter(e => e)
    )

    if (array?.length) {
      if (annualRecurrence) {
        array = 'tous les ans '.concat(array)
      }
      textArray.push(array)
    }
  }

  if (dates?.length) {
    const array = toArrayString(
      dates
        .map(date => {
          if (date) {
            return `le ${dateToString(date)}`
          }

          return undefined
        })
        .filter(e => e)
    )

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
    const array = toArrayString(
      timeIntervals
        .map(({ from, to }) => {
          if (from && to) {
            return `de ${convertTimeToString(from)} à ${convertTimeToString(to)}`
          }

          return undefined
        })
        .filter(e => e)
    )

    if (array?.length) {
      textArray.push(array)
    }
  } else if (daytime) {
    textArray.push('du lever au coucher du soleil')
  }

  if (textArray?.length) {
    return `Pêche ${authorized ? 'autorisée' : 'interdite'} `.concat(textArray.join(', '))
  }

  return undefined
}

/**
 * sortLayersTopicsByRegTerritory
 * Sort the layer topics group by regulatory territory
 * respecting a particular order.
 * @param {Map<string, RegulatoryTopics} layersTopicsByRegTerritory
 * @returns {Map<string, RegulatoryTopics}
 */
export const sortLayersTopicsByRegTerritory = layersTopicsByRegTerritory => {
  const UEObject = { ...layersTopicsByRegTerritory[UE] }

  const FRObject = { ...layersTopicsByRegTerritory[FRANCE] }
  const newFRObject = {
    [REG_MED]: FRObject[REG_MED],
    [REG_MEMN]: FRObject[REG_MEMN],
    [REG_NAMO]: FRObject[REG_NAMO],
    [REG_OUTRE_MER]: FRObject[REG_OUTRE_MER],
    [REG_SA]: FRObject[REG_SA]
  }

  return {
    [FRANCE]: newFRObject,
    [UE]: UEObject.sort()
  }
}

export const getTitle = regulatory => (regulatory ? regulatory.zone : '')

/**
 * @function checkUrl
 * @param {String} url
 * @returns true if the url parameter is a correct url, else false
 */
export const checkURL = url => {
  const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

  return regex.test(url)
}
