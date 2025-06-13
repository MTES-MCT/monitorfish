import type { Feature, Point } from 'geojson'

export type InterestPointProperties = {
  name: string | undefined
  observations: string | undefined
  type: string
}

export type InterestPoint = Feature<Point, InterestPointProperties> & {
  id: string
}
