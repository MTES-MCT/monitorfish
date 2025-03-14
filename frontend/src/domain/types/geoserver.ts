import type { FeatureCollection, Geometry } from 'geojson'

export type CRS = {
  properties: Object
  type: string
}

export type WFSGetFeature<T extends Geometry> = FeatureCollection<T> & {
  bbox: number[]
  crs: CRS
  numberMatched: number
  numberReturned: number
  timeStamp: string
  totalFeatures: number
  type: string
}
