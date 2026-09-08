import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'

import type { FavoriteVesselVesselIdentity } from './types'
import type { Vessel } from '@features/Vessel/Vessel.types'

export function getVesselIdentityFromFavoriteVessel(
  favoriteVessel: FavoriteVesselVesselIdentity
): Vessel.VesselIdentity {
  return {
    beaconNumber: undefined,
    districtCode: undefined,
    externalReferenceNumber: favoriteVessel.externalIdentification,
    flagState: favoriteVessel.flagState ?? 'UNDEFINED',
    internalReferenceNumber: favoriteVessel.cfr,
    ircs: favoriteVessel.ircs,
    mmsi: undefined,
    vesselId: favoriteVessel.vesselId,
    vesselIdentifier: favoriteVessel.vesselIdentifier,
    vesselLength: undefined,
    vesselName: favoriteVessel.name
  }
}

export function getFavoriteVesselFromVesselIdentity(
  vesselIdentity: Vessel.VesselIdentity
): FavoriteVesselVesselIdentity {
  return {
    cfr: vesselIdentity.internalReferenceNumber,
    externalIdentification: vesselIdentity.externalReferenceNumber,
    flagState: vesselIdentity.flagState,
    ircs: vesselIdentity.ircs,
    name: vesselIdentity.vesselName,
    vesselId: vesselIdentity.vesselId,
    vesselIdentifier: vesselIdentity.vesselIdentifier
  }
}

/**
 * Whether both identities designate the same vessel: by `vesselId` when both carry one, else by the
 * identifier field designated by `vesselIdentifier` when both agree, else by any identifier field shared
 * by both. Mirrors the backend `VesselIdentity.isSameVesselAs`.
 */
export function isSameVesselIdentity(first: Vessel.VesselIdentity, second: Vessel.VesselIdentity): boolean {
  if (first.vesselId !== undefined && second.vesselId !== undefined) {
    return first.vesselId === second.vesselId
  }

  if (first.vesselIdentifier !== undefined) {
    switch (first.vesselIdentifier) {
      case VesselIdentifier.INTERNAL_REFERENCE_NUMBER:
        return (
          first.vesselIdentifier === second.vesselIdentifier &&
          first.internalReferenceNumber === second.internalReferenceNumber
        )
      case VesselIdentifier.IRCS:
        return first.vesselIdentifier === second.vesselIdentifier && first.ircs === second.ircs
      case VesselIdentifier.EXTERNAL_REFERENCE_NUMBER:
        return (
          first.vesselIdentifier === second.vesselIdentifier &&
          first.externalReferenceNumber === second.externalReferenceNumber
        )
      default:
        return false
    }
  }

  if (first.internalReferenceNumber && second.internalReferenceNumber) {
    return first.internalReferenceNumber === second.internalReferenceNumber
  }

  if (first.ircs && second.ircs) {
    return first.ircs === second.ircs
  }

  if (first.externalReferenceNumber && second.externalReferenceNumber) {
    return first.externalReferenceNumber === second.externalReferenceNumber
  }

  return false
}
