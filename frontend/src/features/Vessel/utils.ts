import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import type {
  VesselEnhancedLastPositionWebGLObject,
  VesselLastPositionFeature
} from '../../domain/entities/vessel/types'

export function buildFeature(vessel: VesselEnhancedLastPositionWebGLObject): VesselLastPositionFeature {
  const propertiesUsedForStyling = {
    coordinates: vessel.coordinates,
    course: vessel.vesselProperties.course,
    filterPreview: vessel.filterPreview,
    hasBeaconMalfunction: vessel.hasBeaconMalfunction,
    isAtPort: vessel.vesselProperties.isAtPort,
    isFiltered: vessel.isFiltered,
    lastPositionSentAt: vessel.lastPositionSentAt,
    speed: vessel.vesselProperties.speed
  }

  const feature = new Feature({
    vesselFeatureId: vessel.vesselFeatureId,
    ...propertiesUsedForStyling,
    geometry: new Point(vessel.coordinates)
  }) as VesselLastPositionFeature
  feature.setId(vessel.vesselFeatureId)
  feature.vesselProperties = vessel.vesselProperties

  return feature
}
