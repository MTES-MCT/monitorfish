import type { GeoJSON } from './GeoJSON'

export type BaseRegulatoryZone = {
  topic: string
  zone: string
}

export type RegulatoryZone = BaseRegulatoryZone & {
  color: string
  fishingPeriod: FishingPeriod
  gearRegulation: GearRegulation
  geometry: GeoJSON.Geometry
  id: string
  lawType: string
  nextId: string
  otherInfo: string
  region: string
  regulatoryReferences: RegulatoryText[] | undefined
  showed: boolean
  speciesRegulation: SpeciesRegulation
}

export type RegulatoryText = {
  // TODO Use `Infinity`
  endDate: Date | 'infinite'
  reference: string
  startDate: Date
  // TODO Doesn't exist.
  textType: any
  // textType: RegulatoryTextType
  url: string
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
  annualRecurrence: boolean | undefined
  authorized: boolean | undefined
  dateRanges: DateInterval[]
  // ISO-8601 date
  dates: string[]
  daytime: boolean | undefined
  holidays: boolean | undefined
  otherInfo: string | undefined
  timeIntervals: TimeInterval[]
  weekdays: string[]
}

export type RegulatedSpecies = {
  allSpecies: boolean | undefined
  otherInfo: string | undefined
  species: RegulatedSpeciesDetail[]
  /** group name */
  speciesGroups: string[]
}

export type SpeciesRegulation = {
  authorized: RegulatedSpecies
  otherInfo: string | undefined
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
  otherInfo: string | undefined
  unauthorized: RegulatedGears
}

export type RegulatedGears = {
  allGears: boolean | undefined
  allPassiveGears: boolean | undefined
  allTowedGears: boolean | undefined
  derogation: boolean | undefined
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
