import { uniq } from 'lodash'

import { getOptionsFromStrings } from '../../utils/getOptionsFromStrings'

import type { ControlUnit } from '../types/controlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function getControlUnitsOptionsFromControlUnits(
  controlUnits: ControlUnit.ControlUnit[] | undefined = [],
  selectedAdministrations?: string[]
): {
  administrationsAsOptions: Option[]
  unitsAsOptions: Option[]
} {
  const activeControlUnits = controlUnits.filter(({ isArchived }) => !isArchived)

  const administrations = activeControlUnits.map(({ administration }) => administration)
  const uniqueAdministrations = uniq(administrations)
  const uniqueSortedAdministrations = uniqueAdministrations.sort()
  const administrationsAsOptions = getOptionsFromStrings(uniqueSortedAdministrations)

  const units = activeControlUnits
    .filter(({ administration }) => filterByAdministration(selectedAdministrations, administration))
    .map(({ name }) => name)
  const uniqueUnits = uniq(units)
  const uniqueSortedUnits = uniqueUnits.sort()
  const unitsAsOptions = getOptionsFromStrings(uniqueSortedUnits)

  return {
    administrationsAsOptions,
    unitsAsOptions
  }
}

function filterByAdministration(selectedAdministrations: string[] | undefined, administration: string) {
  if (!selectedAdministrations) {
    return true
  }

  return selectedAdministrations.includes(administration)
}
