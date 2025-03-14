import type { Polygon } from 'geojson'

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
  zonesSelected: ZoneFilter[]
}

export type ZoneFilter = {
  code: string
  feature: Polygon
  name: string
}

export type FilterTag = {
  type: string
  uuid?: string | undefined
  value: string | number
}
