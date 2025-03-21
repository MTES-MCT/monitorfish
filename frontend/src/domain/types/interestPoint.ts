import type { Feature, Point } from 'geojson'

export type InterestPoint = {
  /** [longitude, latitude] coordinates */
  coordinates: [number, number]
  feature: Feature<Point>
  name: string | null
  observations: string | null
  type: string
  uuid: string
}
