import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'

import { Vessel } from './Vessel.types'

import type { VesselGroupDisplayInformation } from '../../workers/types'
import type { PendingAlert, SilencedAlert } from '@features/Alert/types'
import type { Reporting } from '@features/Reporting/types'

export function buildFeature(
  vessel: Vessel.ActiveVesselEmittingPosition,
  vesselGroupDisplayed: VesselGroupDisplayInformation
): Vessel.VesselLastPositionFeature {
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
    estimatedCurrentLatitude: vessel.estimatedCurrentLatitude,
    estimatedCurrentLongitude: vessel.estimatedCurrentLongitude,
    externalReferenceNumber: vessel.externalReferenceNumber,
    flagState: vessel.flagState,
    geometry: new Point(vessel.coordinates),
    groupColorBlue: vesselGroupDisplayed.groupColor[2],
    groupColorGreen: vesselGroupDisplayed.groupColor[1],
    groupColorRed: vesselGroupDisplayed.groupColor[0],
    groupsDisplayed: vesselGroupDisplayed.groupsDisplayed,
    hasAlert: vessel.hasAlert,
    hasBeaconMalfunction: vessel.hasBeaconMalfunction,
    hasInfractionSuspicion: vessel.hasInfractionSuspicion,
    impactRiskFactor: vessel.impactRiskFactor,
    internalReferenceNumber: vessel.internalReferenceNumber,
    ircs: vessel.ircs,
    isAtPort: vessel.isAtPort,
    isFiltered: vessel.isFiltered,
    lastControlDateTime: vessel.lastControlDateTime,
    lastLogbookMessageDateTime: vessel.lastLogbookMessageDateTime,
    lastPositionSentAt: vessel.lastPositionSentAt,
    latitude: vessel.latitude,
    length: vessel.length,
    longitude: vessel.longitude,
    mmsi: vessel.mmsi,
    numberOfGroupsHidden: vesselGroupDisplayed.numberOfGroupsHidden,
    probabilityRiskFactor: vessel.probabilityRiskFactor,
    riskFactor: vessel.riskFactor,
    segments: vessel.segments,
    speciesArray: vessel.speciesArray,
    speed: vessel.speed,
    underCharter: vessel.underCharter,
    vesselFeatureId: vessel.vesselFeatureId,
    vesselId: vessel.vesselId,
    vesselIdentifier: vessel.vesselIdentifier,
    vesselName: vessel.vesselName
  }) as Vessel.VesselLastPositionFeature
  feature.setId(vessel.vesselFeatureId)

  return feature
}

export const extractVesselIdentityProps = (
  vessel:
    | Vessel.ActiveVessel
    | Vessel.SelectedVessel
    | Reporting.Reporting
    | PendingAlert
    | SilencedAlert
    | Vessel.VesselIdentity
): Vessel.VesselIdentity => ({
  beaconNumber: 'beaconNumber' in vessel && !!vessel.beaconNumber ? vessel.beaconNumber : undefined,
  districtCode: 'districtCode' in vessel && !!vessel.districtCode ? vessel.districtCode : undefined,
  externalReferenceNumber: vessel.externalReferenceNumber ?? undefined,
  flagState: vessel.flagState,
  internalReferenceNumber: vessel.internalReferenceNumber ?? undefined,
  ircs: 'ircs' in vessel && !!vessel.ircs ? vessel.ircs : undefined,
  mmsi: 'mmsi' in vessel && !!vessel.mmsi ? vessel.mmsi : undefined,
  vesselId: 'vesselId' in vessel && !!vessel.vesselId ? vessel.vesselId : undefined,
  vesselIdentifier: 'vesselIdentifier' in vessel && !!vessel.vesselIdentifier ? vessel.vesselIdentifier : undefined,
  vesselLength: undefined,
  vesselName: vessel.vesselName ?? undefined
})

// Type to enforce strong typing: properties specified in `K` will be required, others will remain optional
type VesselProperties<K extends keyof Vessel.VesselLastPositionFeature> = Required<
  Pick<Vessel.VesselLastPositionFeature, K>
> &
  Partial<Omit<Vessel.VesselLastPositionFeature, K>>
export function extractVesselPropertiesFromFeature<K extends keyof Vessel.VesselLastPositionFeature>(
  feature: Vessel.VesselLastPositionFeature,
  requiredProperties: K[]
): VesselProperties<K> {
  const vesselProperties: any = {}

  requiredProperties.forEach(property => {
    vesselProperties[property] = feature.get(property)
  })

  return vesselProperties as VesselProperties<K>
}

export function getVesselIdentityPropsAsEmptyStringsWhenUndefined(vesselIdentity: Vessel.VesselIdentity) {
  return {
    externalReferenceNumber: vesselIdentity.externalReferenceNumber ?? '',
    internalReferenceNumber: vesselIdentity.internalReferenceNumber ?? '',
    ircs: vesselIdentity.ircs ?? '',
    vesselId: vesselIdentity.vesselId ?? '',
    vesselIdentifier: vesselIdentity.vesselIdentifier ?? ''
  }
}

export function getVesselIdentityFromLegacyVesselIdentity(
  legacyVesselIdentity: Vessel.VesselIdentity
): Vessel.VesselIdentity {
  return {
    beaconNumber: legacyVesselIdentity.beaconNumber ?? undefined,
    districtCode: legacyVesselIdentity.districtCode ?? undefined,
    externalReferenceNumber: legacyVesselIdentity.externalReferenceNumber ?? undefined,
    flagState: legacyVesselIdentity.flagState,
    internalReferenceNumber: legacyVesselIdentity.internalReferenceNumber ?? undefined,
    ircs: legacyVesselIdentity.ircs ?? undefined,
    mmsi: legacyVesselIdentity.mmsi ?? undefined,
    vesselId: legacyVesselIdentity.vesselId ?? undefined,
    vesselIdentifier: legacyVesselIdentity.vesselIdentifier ?? undefined,
    vesselLength: legacyVesselIdentity.vesselLength ?? undefined,
    vesselName: legacyVesselIdentity.vesselName ?? undefined
  }
}

export const getVesselCompositeIdentifier: (vessel) => Vessel.VesselCompositeIdentifier = vessel =>
  `${vessel.internalReferenceNumber ?? 'UNKNOWN'}/${vessel.ircs ?? 'UNKNOWN'}/${
    vessel.externalReferenceNumber ?? 'UNKNOWN'
  }`
