import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { Vessel } from '@features/Vessel/Vessel.types'

export function enrichWithVesselIdentifierIfUndefined(identity: Vessel.VesselIdentity): Vessel.VesselIdentity {
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
