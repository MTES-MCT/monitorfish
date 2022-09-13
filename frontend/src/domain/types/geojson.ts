export type CRS = {
  properties: Object
  type: string
}

export type GeoJSON = {
  bbox: number[]
  crs: CRS
  features: Object[]
  numberMatched: number
  numberReturned: number
  timeStamp: string
  totalFeatures: number
  type: string
}

export type GeoJSONGeometry = {
  geometry: { coordinates: Object; type: string }
}
