import { uniq } from 'lodash'

import { getOptionsFromStrings } from '../../utils/getOptionsFromStrings'

import type { ControlUnit } from '../types/controlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function getControlUnitsOptionsFromControlUnits(controlUnits: ControlUnit.ControlUnit[] | undefined = []): {
  administrationsAsOptions: Option[]
  unitsAsOptions: Option[]
} {
  const activeControlUnits = controlUnits.filter(({ isArchived }) => !isArchived)

  const administrations = activeControlUnits.map(({ administration }) => administration)
  const uniqueAdministrations = uniq(administrations)
  const uniqueSortedAdministrations = uniqueAdministrations.sort()
  const administrationsAsOptions = getOptionsFromStrings(uniqueSortedAdministrations)

  const units = activeControlUnits.map(({ name }) => name)
  const uniqueUnits = uniq(units)
  const uniqueSortedUnits = uniqueUnits.sort()
  const unitsAsOptions = getOptionsFromStrings(uniqueSortedUnits)

  return {
    administrationsAsOptions,
    unitsAsOptions
  }
}
