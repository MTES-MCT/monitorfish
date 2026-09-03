import type { FavoriteVesselVesselIdentity } from './types'
import type { Vessel } from '@features/Vessel/Vessel.types'

/**
 * Map a favorite vessel (backend shape) to the `Vessel.VesselIdentity` shape used by the map/sidebar use cases.
 */
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

/**
 * Map a `Vessel.VesselIdentity` to the favorite vessel (backend shape) sent to the favorite vessels API.
 */
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
