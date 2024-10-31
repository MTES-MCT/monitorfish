import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import {
  VesselIdentifier,
  type VesselEnhancedLastPositionWebGLObject,
  type VesselIdentity,
  type VesselLastPositionFeature
} from '../../domain/entities/vessel/types'

import type { Vessel } from './Vessel.types'

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

// Type to enforce strong typing: properties specified in `K` will be required, others will remain optional
type VesselProperties<K extends keyof VesselEnhancedLastPositionWebGLObject> = Required<
  Pick<VesselEnhancedLastPositionWebGLObject, K>
> &
  Partial<Omit<VesselEnhancedLastPositionWebGLObject, K>>

export function extractVesselPropertiesFromFeature<K extends keyof VesselEnhancedLastPositionWebGLObject>(
  feature: VesselLastPositionFeature,
  requiredProperties: K[]
): VesselProperties<K> {
  const vesselProperties: any = {}

  requiredProperties.forEach(property => {
    vesselProperties[property] = feature.get(property)
  })

  return vesselProperties as VesselProperties<K>
}

export function getVesselIdentityFromVessel(vessel: Vessel.Vessel): VesselIdentity {
  const vesselIdentifier = getVesselIdentifier(vessel)

  return {
    districtCode: vessel.districtCode ?? null,
    externalReferenceNumber: vessel.externalReferenceNumber ?? null,
    flagState: vessel.flagState,
    internalReferenceNumber: vessel.internalReferenceNumber ?? null,
    ircs: vessel.ircs ?? null,
    mmsi: vessel.mmsi ?? null,
    vesselId: vessel.vesselId ?? null,
    vesselIdentifier: vesselIdentifier ?? null,
    vesselName: vessel.vesselName ?? null
  }
}

export function getVesselIdentifier({
  externalReferenceNumber,
  internalReferenceNumber,
  ircs
}: {
  externalReferenceNumber: string | undefined
  internalReferenceNumber: string | undefined
  ircs: string | undefined
}): VesselIdentifier | undefined {
  switch (true) {
    case !!internalReferenceNumber:
      return VesselIdentifier.INTERNAL_REFERENCE_NUMBER

    case !!externalReferenceNumber:
      return VesselIdentifier.EXTERNAL_REFERENCE_NUMBER

    case !!ircs:
      return VesselIdentifier.IRCS

    default:
      return undefined
  }
}
