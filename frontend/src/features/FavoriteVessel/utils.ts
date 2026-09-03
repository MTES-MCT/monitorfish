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
 * identifier field designated by `vesselIdentifier`. Mirrors the backend `VesselIdentity.isSameVesselAs`.
 */
export function isSameVesselIdentity(first: Vessel.VesselIdentity, second: Vessel.VesselIdentity): boolean {
  if (first.vesselId !== undefined && second.vesselId !== undefined) {
    return first.vesselId === second.vesselId
  }

  switch (first.vesselIdentifier ?? second.vesselIdentifier) {
    case VesselIdentifier.INTERNAL_REFERENCE_NUMBER:
      return !!first.internalReferenceNumber && first.internalReferenceNumber === second.internalReferenceNumber
    case VesselIdentifier.IRCS:
      return !!first.ircs && first.ircs === second.ircs
    case VesselIdentifier.EXTERNAL_REFERENCE_NUMBER:
      return !!first.externalReferenceNumber && first.externalReferenceNumber === second.externalReferenceNumber
    default:
      return false
  }
}
