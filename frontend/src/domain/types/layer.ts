import { Feature } from 'ol'
import VectorImageLayer from 'ol/layer/VectorImage'

import type { RegulatoryZone } from '../../features/Regulation/types'
import type { Geometry } from 'ol/geom'
import type VectorLayer from 'ol/layer/Vector'
import type WebGLPointsLayer from 'ol/layer/WebGLPoints'

export type TopicContainingMultipleZones = {
  regulatoryZones: RegulatoryZone[]
  type: string
}

export type AdministrativeOrRegulatoryLayerIdentity = {
  id: string
  topic: string | undefined
  type: string
  zone: string | undefined
}

export type LayerToFeatures = {
  area: number
  center: number[]
  features: Object[]
  name: string
  simplifiedFeatures: Object[]
}

export type VectorLayerWithName = VectorLayer<Feature<Geometry>> & {
  name?: string
}

export type VectorImageLayerWithName = VectorImageLayer<Feature<Geometry>> & {
  name?: string
}

export type WebGLPointsLayerWithName = WebGLPointsLayer<any> & {
  name?: string
}
