import type { GeoJSON } from './GeoJSON'

export type VesselFilter = {
  color: string
  filters: FilterValues
  name: string
  showed: boolean
  uuid: string
}

export type FilterValues = {
  countriesFiltered: string[]
  districtsFiltered: string[]
  fleetSegmentsFiltered: string[]
  gearsFiltered: string[]
  lastControlMonthsAgo: number | null
  speciesFiltered: string[]
  vesselsSizeValuesChecked: string[]
  zonesSelected: ZoneSelected[]
}

export type ZoneSelected = {
  code: string
  feature: GeoJSON.Feature
  name: string
}
