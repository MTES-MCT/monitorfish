import { ascend, map, pipe, prop, sort, uniq } from 'ramda'

import { sortByAscendingValue } from '../../../../../utils/sortByAscendingValue'

import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function findControlUnitByAdministrationAndName(
  controlUnits: ControlUnit[],
  administration: ControlUnit['administration'],
  name: ControlUnit['name']
): ControlUnit | undefined {
  return controlUnits.find(controlUnit => controlUnit.administration === administration && controlUnit.name === name)
}

export const mapControlUnitsToUniqueSortedAdministrationsAsOptions: (controlUnits: ControlUnit[]) => Option[] = pipe(
  map(prop('administration')),
  uniq,
  sortByAscendingValue,
  map(administration => ({
    label: String(administration),
    value: String(administration)
  }))
)

export const mapControlUnitsToUniqueSortedNamesAsOptions: (controlUnits: ControlUnit[]) => Option[] = pipe(
  map(prop('name')),
  uniq,
  sortByAscendingValue,
  map(name => ({
    label: String(name),
    value: String(name)
  }))
)

export const mapControlUnitToResourcesAsOptions: (controlUnit: ControlUnit) => Option<number>[] = pipe(
  prop('resources'),
  sort(ascend(prop('name'))),
  map(({ id, name }: ControlUnit['resources'][0]) => ({
    label: name,
    value: id
  }))
)
