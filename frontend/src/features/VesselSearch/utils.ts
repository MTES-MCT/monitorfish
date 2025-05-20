import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { Vessel } from '@features/Vessel/Vessel.types'

/**
 * Remove duplicated vessels : keep vessels from APIs when a duplicate is found on either
 * - internalReferenceNumber (CFR) or
 * - vesselId (Vessel internal identifier)
 */
export function removeDuplicatedFoundVessels(
  foundVesselsFromAPI: Vessel.VesselIdentity[],
  foundVesselsOnMap: Vessel.VesselIdentity[]
): Vessel.VesselIdentity[] {
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

export function enrichWithVesselIdentifierIfNotFound(
  identityOrVessel: Vessel.ActiveVesselEmittingPosition | Vessel.VesselIdentity
): Vessel.VesselIdentity {
  const vesselIdentity = extractVesselIdentityProps(identityOrVessel)

  if (vesselIdentity.vesselIdentifier) {
    return vesselIdentity
  }

  if (vesselIdentity.internalReferenceNumber) {
    return { ...vesselIdentity, vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER }
  }

  if (vesselIdentity.ircs) {
    return { ...vesselIdentity, vesselIdentifier: VesselIdentifier.IRCS }
  }

  if (vesselIdentity.externalReferenceNumber) {
    return { ...vesselIdentity, vesselIdentifier: VesselIdentifier.EXTERNAL_REFERENCE_NUMBER }
  }

  return vesselIdentity
}
