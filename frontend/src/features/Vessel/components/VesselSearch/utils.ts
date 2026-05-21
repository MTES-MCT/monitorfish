import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { Vessel } from '@features/Vessel/Vessel.types'

import type { AISVessel } from '@features/Vessel/AISVessel.types'

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

export function aisVesselToVesselIdentity(vessel: AISVessel.AISVessel): Vessel.VesselIdentity {
  return {
    beaconNumber: undefined,
    districtCode: undefined,
    externalReferenceNumber: undefined,
    flagState: vessel.flagState,
    internalReferenceNumber: undefined,
    ircs: vessel.ircs,
    mmsi: String(vessel.mmsi),
    vesselId: undefined,
    vesselIdentifier: undefined,
    vesselLength: undefined,
    vesselName: vessel.vesselName
  }
}
