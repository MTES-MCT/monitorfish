import type { GeoJSON } from './geojson'

export type InterestPoint = {
  /** [longitude, latitude] coordinates */
  coordinates: [number, number]
  feature: GeoJSON
  name: string | null
  observations: string | null
  type: string
  uuid: string
}
