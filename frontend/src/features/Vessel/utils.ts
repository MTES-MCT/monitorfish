import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import type {
  VesselEnhancedLastPositionWebGLObject,
  VesselLastPositionFeature
} from '../../domain/entities/vessel/types'

export function buildFeature(vessel: VesselEnhancedLastPositionWebGLObject): VesselLastPositionFeature {
  /**
   * The feature does contain ONLY required properties, it does not contain all properties of VesselLastPosition.
   */
  const feature = new Feature({
    alerts: vessel.alerts,
    beaconMalfunctionId: vessel.beaconMalfunctionId,
    coordinates: vessel.coordinates,
    course: vessel.course,
    dateTime: vessel.dateTime,
    detectabilityRiskFactor: vessel.detectabilityRiskFactor,
    emissionPeriod: vessel.emissionPeriod,
    externalReferenceNumber: vessel.externalReferenceNumber,
    filterPreview: vessel.filterPreview,
    flagState: vessel.flagState,
    geometry: new Point(vessel.coordinates),
    hasAlert: vessel.hasAlert,
    hasBeaconMalfunction: vessel.hasBeaconMalfunction,
    hasInfractionSuspicion: vessel.hasInfractionSuspicion,
    impactRiskFactor: vessel.impactRiskFactor,
    internalReferenceNumber: vessel.internalReferenceNumber,
    ircs: vessel.ircs,
    isAtPort: vessel.isAtPort,
    isFiltered: vessel.isFiltered,
    lastControlDateTime: vessel.lastControlDateTime,
    lastControlDateTimeTimestamp: vessel.lastControlDateTimeTimestamp,
    lastLogbookMessageDateTime: vessel.lastLogbookMessageDateTime,
    lastPositionSentAt: vessel.lastPositionSentAt,
    length: vessel.length,
    mmsi: vessel.mmsi,
    probabilityRiskFactor: vessel.probabilityRiskFactor,
    riskFactor: vessel.riskFactor,
    segments: vessel.segments,
    speciesArray: vessel.speciesArray,
    speed: vessel.speed,
    underCharter: vessel.underCharter,
    vesselFeatureId: vessel.vesselFeatureId,
    vesselId: vessel.vesselId,
    vesselIdentifier: vessel.vesselIdentifier,
    vesselName: vessel.vesselName,
    width: vessel.width
  }) as VesselLastPositionFeature
  feature.setId(vessel.vesselFeatureId)

  return feature
}
