import type { GeoJSON } from 'geojson'

export type CustomZone = {
  feature: GeoJSON
  isShown: boolean
  name: string
  uuid: string
}
