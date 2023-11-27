import { sortBy, uniq } from 'lodash'

import { getOptionsFromStrings } from '../../../../../utils/getOptionsFromStrings'

import type { LegacyControlUnit } from '../../../../../domain/types/legacyControlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function findControlUnitByname(
  controlUnits: LegacyControlUnit.LegacyControlUnit[],
  name: LegacyControlUnit.LegacyControlUnit['name']
): LegacyControlUnit.LegacyControlUnit | undefined {
  return controlUnits.find(controlUnit => controlUnit.name === name)
}

export function mapControlUnitsToUniqueSortedNamesAsOptions(
  controlUnits: LegacyControlUnit.LegacyControlUnit[]
): Option[] {
  const names = controlUnits.map(({ name }) => name)
  const uniqueNames = uniq(names)
  const uniqueSortedNames = uniqueNames.sort()
  const uniqueSortedNamesAsOptions = getOptionsFromStrings(uniqueSortedNames)

  return uniqueSortedNamesAsOptions
}

export function mapControlUnitToSortedResourcesAsOptions(
  controlUnit: LegacyControlUnit.LegacyControlUnit
): Array<Option<LegacyControlUnit.LegacyControlUnitResource>> {
  const sortedResources = sortBy(controlUnit.resources, ({ name }) => name)
  const sortedResourcesAsOptions = sortedResources.map(sortedResource => ({
    label: sortedResource.name,
    value: sortedResource
  }))

  return sortedResourcesAsOptions
}
