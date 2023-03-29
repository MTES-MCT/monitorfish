import { ascend, map, pipe, prop, sort, sortWith, uniq, uniqBy } from 'ramda'

import { sortByAscendingValue } from '../../../../../utils/sortByAscendingValue'

import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function findControlUnitById(
  controlUnits: ControlUnit.ControlUnit[],
  id: ControlUnit.ControlUnit['id']
): ControlUnit.ControlUnit | undefined {
  return controlUnits.find(controlUnit => controlUnit.id === id)
}

export const mapControlUnitsToUniqueSortedAdministrationsAsOptions: (
  controlUnits: ControlUnit.ControlUnit[]
) => Option[] = pipe(
  map(prop('administration')),
  uniq,
  sortByAscendingValue,
  map(administration => ({
    label: administration,
    value: administration
  }))
)

export const mapControlUnitsToUniqueSortedNamesAsOptions: (
  controlUnits: ControlUnit.ControlUnit[]
) => Array<Option<number>> = pipe(
  uniqBy<ControlUnit.ControlUnit, string>(({ administration, name }) => `${administration}-${name}`),
  sortWith([ascend(prop('administration')), ascend(prop('name'))]),
  map(({ id, name }) => ({
    label: name,
    value: id
  }))
)

export const mapControlUnitToResourcesAsOptions: (controlUnit: ControlUnit.ControlUnit) => Option<number>[] = pipe(
  prop('resources'),
  sort(ascend(prop('name'))),
  map(({ id, name }: ControlUnit.ControlUnit['resources'][0]) => ({
    label: name,
    value: id
  }))
)
