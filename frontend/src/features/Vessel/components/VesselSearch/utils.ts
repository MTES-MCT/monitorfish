import { Vessel } from '@features/Vessel/Vessel.types'

export function enrichWithVesselIdentifierIfUndefined(identity: Vessel.VesselIdentity): Vessel.VesselIdentity {
  if (identity.vesselIdentifier) {
    return identity
  }

  if (identity.internalReferenceNumber) {
    return { ...identity, vesselIdentifier: Vessel.VesselIdentifier.INTERNAL_REFERENCE_NUMBER }
  }

  if (identity.ircs) {
    return { ...identity, vesselIdentifier: Vessel.VesselIdentifier.IRCS }
  }

  if (identity.externalReferenceNumber) {
    return { ...identity, vesselIdentifier: Vessel.VesselIdentifier.EXTERNAL_REFERENCE_NUMBER }
  }

  return identity
}
