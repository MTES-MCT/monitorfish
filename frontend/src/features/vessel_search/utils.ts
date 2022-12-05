import { VesselIdentifier } from '../../domain/entities/vessel/types'

import type { VesselIdentity } from '../../domain/entities/vessel/types'

export function removeDuplicatedFoundVessels(
  foundVesselsFromAPI: VesselIdentity[],
  foundVesselsOnMap: VesselIdentity[]
): VesselIdentity[] {
  const filteredVesselsFromMap = foundVesselsOnMap.filter(vesselFromMap => {
    if (!vesselFromMap.internalReferenceNumber) {
      return false
    }

    return !foundVesselsFromAPI.some(
      vesselFromApi => vesselFromApi.internalReferenceNumber === vesselFromMap.internalReferenceNumber
    )
  })

  return foundVesselsFromAPI.concat(filteredVesselsFromMap)
}

export function addVesselIdentifierToVesselIdentity(identity: VesselIdentity): VesselIdentity {
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
