import { VesselIdentifier } from '../../domain/entities/vessel/types'

import type { VesselIdentity, VesselEnhancedObject } from '../../domain/entities/vessel/types'

/**
 * Remove duplicated vessels : keep vessels from APIs when a duplicate is found on either
 * - internalReferenceNumber (CFR) or
 * - vesselId (Vessel internal identifier)
 */
export function removeDuplicatedFoundVessels(
  foundVesselsFromAPI: VesselIdentity[],
  foundVesselsOnMap: VesselIdentity[]
): VesselIdentity[] {
  const filteredVesselsFromMap = foundVesselsOnMap.filter(vesselFromMap => {
    if (!vesselFromMap.internalReferenceNumber) {
      return true
    }

    return !foundVesselsFromAPI.some(
      vesselFromApi =>
        vesselFromApi.internalReferenceNumber === vesselFromMap.internalReferenceNumber ||
        (vesselFromApi.vesselId && vesselFromApi.vesselId === vesselFromMap.vesselId)
    )
  })

  return foundVesselsFromAPI.concat(filteredVesselsFromMap).slice(0, 50)
}

export function enrichWithVesselIdentifierIfNotFound(identity: VesselEnhancedObject | VesselIdentity): VesselIdentity {
  if (identity.vesselIdentifier) {
    return identity
  }

  if (identity.internalReferenceNumber) {
    return { ...identity, vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER }
  }

  if (identity.ircs) {
    return { ...identity, vesselIdentifier: VesselIdentifier.IRCS }
  }

  if (identity.externalReferenceNumber) {
    return { ...identity, vesselIdentifier: VesselIdentifier.EXTERNAL_REFERENCE_NUMBER }
  }

  return identity
}
