import { ControlUnit, customDayjs } from '@mtes-mct/monitor-ui'

import type { Reporting } from '@features/Reporting/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { Option } from '@mtes-mct/monitor-ui'

export const mapControlUnitsToUniqueSortedIdsAsOptions = (controlUnits: ControlUnit.ControlUnit[]): Option<number>[] =>
  Array.from(controlUnits)
    .sort((a, b) => Number(b.name) - Number(a.name))
    .map(controlUnit => ({
      label: `${controlUnit.name} (${controlUnit.administration.name})`,
      value: controlUnit.id
    }))

/**
 * Returns:
 * -  `1`: the second argument is before the second argument
 * - `-1`: the first argument is before the second argument
 */
export function sortByValidationOrCreationDateDesc(a: Reporting.Reporting, b: Reporting.Reporting) {
  if (a.validationDate && b.validationDate) {
    return customDayjs(a.validationDate).isBefore(customDayjs(b.validationDate)) ? 1 : -1
  }

  return customDayjs(a.creationDate).isBefore(customDayjs(b.creationDate)) ? 1 : -1
}

export function buildVesselContext(identity: Vessel.VesselIdentity): Reporting.VesselContext {
  return {
    cfr: identity.internalReferenceNumber,
    externalMarker: identity.externalReferenceNumber,
    flagState: identity.flagState ?? '',
    ircs: identity.ircs,
    length: identity.vesselLength,
    mmsi: identity.mmsi,
    vesselId: identity.vesselId,
    vesselIdentifier: identity.vesselIdentifier,
    vesselName: identity.vesselName
  }
}
