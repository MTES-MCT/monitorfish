import { MonitorFishMap } from '@features/Map/Map.types'

import type { AISVessel } from '@features/Vessel/AISVessel.types'
import type Feature from 'ol/Feature'

export function isAISVesselFeature(feature: Feature | null | undefined): boolean {
  return !!feature?.getId()?.toString()?.startsWith(MonitorFishMap.MonitorFishLayer.AIS_VESSELS)
}

// Type to enforce strong typing: properties specified in `K` will be required, others will remain optional
type VesselProperties<K extends keyof AISVessel.AISVesselLastPositionFeature> = Required<
  Pick<AISVessel.AISVesselLastPositionFeature, K>
> &
  Partial<Omit<AISVessel.AISVesselLastPositionFeature, K>>

export function extractAISVesselPropertiesFromFeature<K extends keyof AISVessel.AISVesselLastPositionFeature>(
  feature: AISVessel.AISVesselLastPositionFeature,
  requiredProperties: K[]
): VesselProperties<K> {
  const vesselProperties = {} as VesselProperties<K>

  requiredProperties.forEach(property => {
    vesselProperties[property] = feature.get(property)
  })

  return vesselProperties
}
