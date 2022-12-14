import type VectorLayer from 'ol/layer/Vector'
import type VectorSource from 'ol/source/Vector'

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

// TODO Why do we have that both in layer.ts and regulation.ts?
export type RegulatoryZone = {
  bycatch: string
  closingDate: string
  deposit: string
  gears: string
  lawType: string
  mandatoryDocuments: string
  obligations: string
  openingDate: string
  period: string
  permissions: string
  prohibitedGears: string
  prohibitedSpecies: string
  prohibitions: string
  quantity: string
  region: string
  regulatoryReferences: string
  rejections: string
  size: string
  species: string
  state: string
  technicalMeasurements: string
  topic: string
  type: string
  zone: string
}

export type VectorLayerWithName = VectorLayer<VectorSource> & {
  name?: string
}
