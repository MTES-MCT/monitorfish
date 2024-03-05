import { ControlUnit, customDayjs } from '@mtes-mct/monitor-ui'

import type { Reporting } from '../../../../../domain/types/reporting'
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
export function sortByValidationOrCreationDateDesc(a: Reporting, b: Reporting) {
  if (a.validationDate && b.validationDate) {
    return customDayjs(a.validationDate).isBefore(customDayjs(b.validationDate)) ? 1 : -1
  }

  return customDayjs(a.creationDate).isBefore(customDayjs(b.creationDate)) ? 1 : -1
}
