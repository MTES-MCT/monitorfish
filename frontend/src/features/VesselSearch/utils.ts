import { Vessel } from '@features/Vessel/Vessel.types'

import type { VesselEnhancedObject } from '../../domain/entities/vessel/types'

export function getVesselIdentityDataFromVesselEnhancedObject(
  vesselEnhancedObject: VesselEnhancedObject
): Vessel.VesselIdentityData {
  return {
    beaconNumber: vesselEnhancedObject.beaconNumber ?? null,
    districtCode: vesselEnhancedObject.districtCode,
    externalReferenceNumber: vesselEnhancedObject.externalReferenceNumber,
    flagState: vesselEnhancedObject.flagState,
    imo: null,
    internalReferenceNumber: vesselEnhancedObject.internalReferenceNumber,
    ircs: vesselEnhancedObject.ircs,
    length: vesselEnhancedObject.length,
    mmsi: vesselEnhancedObject.mmsi,
    vesselId: vesselEnhancedObject.vesselId,
    vesselIdentifier: vesselEnhancedObject.vesselIdentifier,
    vesselName: vesselEnhancedObject.vesselName
  }
}

/**
 * Remove duplicated vessels : keep vessels from APIs when a duplicate is found on either
 * - internalReferenceNumber (CFR) or
 * - vesselId (Vessel internal identifier)
 */
export function removeDuplicatesFromFoundVesselIdentities(
  foundVesselsFromApi: Vessel.VesselIdentity[],
  foundVesselsFromMap: Vessel.VesselIdentityData[]
): Vessel.VesselIdentityData[] {
  const filteredVesselsFromMap = foundVesselsFromMap.filter(vesselFromMap => {
    if (!vesselFromMap.internalReferenceNumber) {
      return true
    }

    return !foundVesselsFromApi.some(
      vesselFromApi =>
        vesselFromApi.internalReferenceNumber === vesselFromMap.internalReferenceNumber ||
        (vesselFromApi.vesselId && vesselFromApi.vesselId === vesselFromMap.vesselId)
    )
  })

  return (foundVesselsFromApi as Vessel.VesselIdentityData[]).concat(filteredVesselsFromMap).slice(0, 50)
}

export function enrichWithVesselIdentifierIfNotFound(
  identity: VesselEnhancedObject | Vessel.VesselIdentityData
): Vessel.VesselIdentityData {
  if (identity.vesselIdentifier) {
    return identity as Vessel.VesselIdentityData
  }

  if (identity.internalReferenceNumber) {
    return { ...identity, vesselIdentifier: Vessel.Identifier.INTERNAL_REFERENCE_NUMBER }
  }

  if (identity.ircs) {
    return { ...identity, vesselIdentifier: Vessel.Identifier.IRCS }
  }

  if (identity.externalReferenceNumber) {
    return { ...identity, vesselIdentifier: Vessel.Identifier.EXTERNAL_REFERENCE_NUMBER }
  }

  return identity
}
