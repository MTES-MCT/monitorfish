import { ascend, map, pipe, prop, sort, sortWith, uniq, uniqBy } from 'ramda'

import { sortByAscendingValue } from '../../../../../utils/sortByAscendingValue'

import type { PartialControlUnitOption } from './types'
import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export function findControlUnitById(controlUnits: ControlUnit[], id: ControlUnit['id']): ControlUnit | undefined {
  return controlUnits.find(controlUnit => controlUnit.id === id)
}

export const mapControlUnitsToUniqueSortedAdministrationsAsOptions: (controlUnits: ControlUnit[]) => Option[] = pipe(
  map(prop('administration')),
  uniq,
  sortByAscendingValue,
  map(administration => ({
    label: administration,
    value: administration
  }))
)

export const mapControlUnitsToUniqueSortedNamesAsOptions: (controlUnits: ControlUnit[]) => PartialControlUnitOption[] =
  pipe(
    uniqBy<ControlUnit, string>(({ administration, name }) => `${administration}-${name}`),
    sortWith([ascend(prop('administration')), ascend(prop('name'))]),
    map(({ administration, id, name }) => ({
      label: name,
      optionValue: {
        administration,
        id,
        name
      },
      value: id
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
