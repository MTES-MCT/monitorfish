import type { RegulatoryZone } from './regulation'
import type { Point } from 'ol/geom'
import type VectorLayer from 'ol/layer/Vector'
import type WebGLPointsLayer from 'ol/layer/WebGLPoints'
import type VectorSource from 'ol/source/Vector'

export type TopicContainingMultipleZones = {
  namespace: string
  regulatoryZones: RegulatoryZone[]
  type: string
}

export type AdministrativeOrRegulatoryLayerIdentity = {
  id: number
  namespace: string
  topic: string | null
  type: string
  zone: string | null
}

export type LayerToFeatures = {
  area: number
  center: number[]
  features: Object[]
  name: string
  simplifiedFeatures: Object[]
}

export type VectorLayerWithName = VectorLayer<VectorSource> & {
  name?: string
}

export type WebGLPointsLayerWithName = WebGLPointsLayer<VectorSource<Point>> & {
  name?: string
}
