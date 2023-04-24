import { sortBy, uniq } from 'lodash'

import { getOptionsFromStrings } from '../../../../../utils/getOptionsFromStrings'

import type { ControlResource } from '../../../../../domain/types/controlResource'
import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function findControlUnitByname(
  controlUnits: ControlUnit.ControlUnit[],
  name: ControlUnit.ControlUnit['name']
): ControlUnit.ControlUnit | undefined {
  return controlUnits.find(controlUnit => controlUnit.name === name)
}

export function mapControlUnitsToUniqueSortedNamesAsOptions(controlUnits: ControlUnit.ControlUnit[]): Option[] {
  const names = controlUnits.map(({ name }) => name)
  const uniqueNames = uniq(names)
  const uniqueSortedNames = uniqueNames.sort()
  const uniqueSortedNamesAsOptions = getOptionsFromStrings(uniqueSortedNames)

  return uniqueSortedNamesAsOptions
}

export function mapControlUnitToSortedResourcesAsOptions(
  controlUnit: ControlUnit.ControlUnit
): Array<Option<ControlResource>> {
  const sortedResources = sortBy(controlUnit.resources, ({ name }) => name)
  const sortedResourcesAsOptions = sortedResources.map(sortedResource => ({
    label: sortedResource.name,
    value: sortedResource
  }))

  return sortedResourcesAsOptions
}
