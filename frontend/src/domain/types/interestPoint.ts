import type { WFSGetFeature } from './geoserver'

export type InterestPoint = {
  /** [longitude, latitude] coordinates */
  coordinates: [number, number]
  feature: WFSGetFeature
  name: string | null
  observations: string | null
  type: string
  uuid: string
}
