import { uniq } from 'lodash/fp'

import type { LegacyControlUnit } from '../../../../domain/types/legacyControlUnit'

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
