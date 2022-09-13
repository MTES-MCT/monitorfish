import type { GeoJSONGeometry } from './geojson'

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
  speciesFiltered: string[]
  vesselsSizeValuesChecked: string[]
  zonesSelected: ZoneSelected[]
}

export type ZoneSelected = {
  code: string
  feature: GeoJSONGeometry
  name: string
}
