import { uniq } from 'lodash'

import { mapControlUnitsToUniqueSortedNamesAsOptions } from '../../../features/SideWindow/MissionForm/MainForm/FormikMultiControlUnitPicker/utils'
import { getOptionsFromStrings } from '../../../utils/getOptionsFromStrings'

import type { LegacyControlUnit } from '../../types/legacyControlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function getControlUnitsOptionsFromControlUnits(
  controlUnits: LegacyControlUnit.LegacyControlUnit[] | undefined = [],
  selectedAdministrations?: string[]
): {
  activeAndFilteredUnitsAsOptions: Option[]
  administrationsAsOptions: Option[]
  allActiveControlUnits: LegacyControlUnit.LegacyControlUnit[]
} {
  const activeControlUnits = controlUnits.filter(({ isArchived }) => !isArchived)

  const administrations = activeControlUnits.map(({ administration }) => administration)
  const uniqueAdministrations = uniq(administrations)
  const uniqueSortedAdministrations = uniqueAdministrations.sort()
  const administrationsAsOptions = getOptionsFromStrings(uniqueSortedAdministrations)

  const units = activeControlUnits.filter(({ administration }) =>
    filterByAdministration(selectedAdministrations, administration)
  )
  const unitsAsOptions = mapControlUnitsToUniqueSortedNamesAsOptions(units)

  return {
    activeAndFilteredUnitsAsOptions: unitsAsOptions,
    administrationsAsOptions,
    allActiveControlUnits: activeControlUnits
  }
}

function filterByAdministration(selectedAdministrations: string[] | undefined, administration: string) {
  if (!selectedAdministrations) {
    return true
  }

  return selectedAdministrations.includes(administration)
}
