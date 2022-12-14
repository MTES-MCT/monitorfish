import type { GeoJSON } from './GeoJSON'

export type BaseRegulatoryZone = {
  topic: string
  zone: string
}

// TODO Clean all regulations types
export type RegulatoryZone = BaseRegulatoryZone & {
  color: string
  gearRegulation: GearRegulation
  geometry: GeoJSON.Geometry
  id: string
  lawType: string
  region: string
  regulatoryReference: RegulatoryText[]
  showed: boolean
  speciesRegulation: SpeciesRegulation
}

export type RegulatoryText = {
  // TODO Use `Infinity`
  endDate: Date | 'infinite'
  startDate: Date
  textName: string
  // TODO Doesn't exist.
  textType: any
  // textType: RegulatoryTextType
  textURL: string
}

// TODO Check that.
/** key is a topic */
// TODO Is it a matrix? The name doesn't reflect that.
export type RegulatoryTopics = Map<string, RegulatoryZone[]>

// TODO Check that.
/** key is the law type name */
// TODO Is it a matrix? The name doesn't reflect that.
// export type RegulatoryLawTypes = Map<string, RegulatoryTopics[]>
export type RegulatoryLawTypes = Record<string, RegulatoryTopics[]>

export type DateInterval = {
  endDate: string | Date
  startDate: string | Date
}

export type TimeInterval = {
  from: Date
  to: Date
}

export type FishingPeriod = {
  always?: boolean
  annualRecurrence: boolean
  authorized: boolean
  dateRanges: [DateInterval]
  // ISO-8601 date
  dates: [string]
  daytime: boolean
  holidays: boolean
  otherInfo: string
  timeIntervals: TimeInterval
  weekdays: [string]
}

export type RegulatorySpeciesDetail = {
  /** FAO code */
  code: string
  remarks: string
}

export type RegulatedSpecies = {
  allSpecies: boolean
  otherInfo: string
  species: RegulatedSpeciesDetail[]
  /** group name */
  speciesGroups: string[]
}

export type SpeciesRegulation = {
  authorized: RegulatedSpecies
  otherInfo: string
  unauthorized: RegulatedSpecies
}

export type Gear = {
  category: string
  code: string
  groupId: string
  mesh: string[]
  /** (One of greaterThan, greaterThanOrEqualTo, lowerThan, lowerThanOrEqualTo, equal, between) */
  meshType: string
  name: string
}

export type GearCategory = {
  mesh: string[]
  meshType: string
  name: string
}

export type GearRegulation = {
  authorized: RegulatedGears
  otherInfo: string
  unauthorized: RegulatedGears
}

export type RegulatedGears = {
  allGears: boolean
  allPassiveGears: boolean
  allTowedGears: boolean
  derogation: boolean
  regulatedGearCategories: Record<string, GearCategory>
  regulatedGears: Gear[]
  /**  a list of categories name and gears code */
  selectedCategoriesAndGears: string[]
}

export type RegulatedSpeciesDetail = {
  /** FAO code */
  code: string
  remarks: string
}
