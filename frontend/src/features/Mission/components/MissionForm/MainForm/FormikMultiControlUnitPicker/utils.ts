import { getOptionsFromStrings } from '@utils/getOptionsFromStrings'
import { isNotArchived } from '@utils/isNotArchived'
import { sortBy, uniq } from 'lodash'

import type { Option } from '@mtes-mct/monitor-ui'
import type { LegacyControlUnit } from 'domain/types/legacyControlUnit'

export function mapControlUnitsToUniqueSortedNamesAsOptions(
  controlUnits: LegacyControlUnit.LegacyControlUnit[]
): Option[] {
  const names = controlUnits.map(({ name }) => name)
  const uniqueNames = uniq(names)
  const uniqueSortedNames = uniqueNames.sort()
  const uniqueSortedNamesAsOptions = getOptionsFromStrings(uniqueSortedNames)

  return uniqueSortedNamesAsOptions
}

export function mapToSortedResourcesAsOptions(
  resources: LegacyControlUnit.LegacyControlUnitResource[]
): Array<Option<LegacyControlUnit.LegacyControlUnitResource>> {
  const sortedResources = sortBy(resources, ({ name }) => name)
  const sortedResourcesAsOptions = sortedResources.map(sortedResource => ({
    label: sortedResource.name,
    value: sortedResource
  }))

  return sortedResourcesAsOptions
}

/**
 * Include archived control units (and administrations) of not found control units if they're already selected
 */
export function getActiveAndSelectedControlUnits(
  allControlUnits: LegacyControlUnit.LegacyControlUnit[],
  value: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
) {
  const allActiveControlUnits =
    allControlUnits.filter(controlUnit => isNotArchived(controlUnit) || value.name === controlUnit.name) || []

  const isSelectedControlUnitFound =
    value.name && allActiveControlUnits.find(controlUnit => controlUnit.name === value.name)
  // If the control unit is not found and the administration is set
  if (!isSelectedControlUnitFound && value.administration && value.name) {
    return allActiveControlUnits.concat(value as LegacyControlUnit.LegacyControlUnit)
  }

  return allActiveControlUnits
}

/**
 * Include missing administration
 */
export function getActiveAndSelectedAdministrationAsOptions(
  activeAdministrationsAsOptions: Option[],
  value: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
) {
  const isAdministrationFound = activeAdministrationsAsOptions.find(
    administration => administration.value === value.administration
  )
  if (!isAdministrationFound && value.administration) {
    return activeAdministrationsAsOptions.concat(getOptionsFromStrings([value.administration]))
  }

  return activeAdministrationsAsOptions
}
