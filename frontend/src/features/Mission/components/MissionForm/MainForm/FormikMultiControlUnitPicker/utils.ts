import { getOptionsFromStrings } from '@utils/getOptionsFromStrings'
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
