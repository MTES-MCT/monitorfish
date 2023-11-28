import type { RegulatoryZone } from '../../features/Regulation/types'
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
  id: number | string
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

export type VectorLayerWithCodeAndId = VectorLayer<VectorSource> & {
  code: string
  id: number
}

export type VectorLayerWithName = VectorLayer<VectorSource> & {
  name?: string
}

export type WebGLPointsLayerWithName = WebGLPointsLayer<VectorSource<Point>> & {
  name?: string
}
