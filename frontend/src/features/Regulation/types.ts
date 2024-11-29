import type { GearMeshSizeEqualityComparator } from '../../domain/entities/backoffice'
import type { GeoJSON } from '../../domain/types/GeoJSON'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'

export type BaseRegulatoryZone = {
  topic: string
  zone: string
}

export type RegulatoryZone = BaseRegulatoryZone & {
  color?: string
  fishingPeriod: FishingPeriod<Date>
  gearRegulation: GearRegulation
  geometry: GeoJSON.Geometry | undefined
  id: number | string | undefined
  lawType: string
  nextId: string | undefined
  otherInfo: string | undefined
  region: string
  regulatoryReferences: RegulatoryText[] | undefined
  showed?: boolean
  speciesRegulation: SpeciesRegulation
}

export type EditedRegulatoryZone = Omit<RegulatoryZone, 'region'> & {
  region: string[] | undefined
}

export type RegulatoryZoneDraft = UndefineExcept<
  EditedRegulatoryZone,
  'fishingPeriod' | 'gearRegulation' | 'speciesRegulation'
>

export type RegulatoryText = {
  // TODO Use `Infinity`
  endDate: Date | 'infinite' | undefined
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
  endDate: string | Date | undefined
  startDate: string | Date | undefined
}

export type TimeInterval = {
  from: Date | undefined
  to: Date | undefined
}

// TODO It would be safer to use strict array types: `DateRange[]` and `DateAsStringRange[]`.
export type FishingPeriod<DateType extends string | Date = string> = {
  always: boolean | undefined
  annualRecurrence: boolean | undefined
  authorized: boolean | undefined
  dateRanges: DateInterval[]
  dates: DateType[]
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
  authorized: RegulatedSpecies | null
  otherInfo: string | undefined
  unauthorized: RegulatedSpecies | null
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
