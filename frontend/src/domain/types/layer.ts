import type { RegulatoryZone } from './regulation'
import type VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'

export type TopicContainingMultipleZones = {
  namespace: string
  regulatoryZones: RegulatoryZone[]
  type: string
}

export type AdministrativeOrRegulatoryLayerIdentity = {
  id: string
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
