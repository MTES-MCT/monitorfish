import type { GearMeshSizeEqualityComparator } from '../../domain/entities/backoffice'
import type { GeoJSON } from '../../domain/types/GeoJSON'

export type BaseRegulatoryZone = {
  topic: string
  zone: string
}

export type RegulatoryZone = BaseRegulatoryZone & {
  color: string
  fishingPeriod: FishingPeriod
  gearRegulation: GearRegulation
  geometry: GeoJSON.Geometry
  id: number | string
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

// TODO Remove this type and declare it inline in corresponding variables.
export type RegulatoryLawTypes = Record<string, Record<string, RegulatoryZone[]>>

export type DateInterval = {
  endDate: string | Date
  startDate: string | Date
}

export type TimeInterval = {
  from: Date
  to: Date
}

export type FishingPeriod = {
  always: boolean | undefined
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
  meshType: GearMeshSizeEqualityComparator
  name: string
  remarks: string | undefined
}

export type GearCategory = {
  mesh: string[] | undefined
  meshType: GearMeshSizeEqualityComparator | undefined
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
  otherInfo: string | undefined
  regulatedGearCategories: Record<string, GearCategory>
  regulatedGears: Record<string, Gear>
  /**  a list of categories name and gears code */
  selectedCategoriesAndGears: string[]
}

export type RegulatedSpeciesDetail = {
  /** FAO code */
  code: string
  name: string
  remarks: string
}
