export type CRS = {
  properties: Object
  type: string
}

export type WFSGetFeature = {
  bbox: number[]
  crs: CRS
  features: Object[]
  numberMatched: number
  numberReturned: number
  timeStamp: string
  totalFeatures: number
  type: string
}
