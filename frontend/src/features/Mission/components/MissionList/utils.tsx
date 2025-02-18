import { uniq } from 'lodash-es'

import type { LegacyControlUnit } from '../../../ControlUnit/legacyControlUnit'

export function getControlUnitsNamesFromAdministrations(
  controlUnits: LegacyControlUnit.LegacyControlUnit[],
  administrations: string[]
): string[] {
  const names = controlUnits
    .filter(({ administration }) => administrations.includes(administration))
    .map(({ name }) => name)
  const uniqueNames = uniq(names)
  const uniqueSortedNames = uniqueNames.sort()

  return uniqueSortedNames
}
