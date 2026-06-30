import { ControlUnit, Tag, pluralize } from '@mtes-mct/monitor-ui'
import { isEmpty } from 'lodash-es'

import { getIconFromControlUnitResourceType } from '../../../ControlUnit/components/ControlUnitDialog/ControlUnitResourceList/utils'

export function displayControlUnitResourcesFromControlUnit(controlUnit: ControlUnit.ControlUnit, stationId: number) {
  const controlUnitResourceTypeCounts = controlUnit.controlUnitResources
    .filter(controlUnitResource => controlUnitResource.stationId === stationId && !controlUnitResource.isArchived)
    .reduce(
      (previousControlUnitResourceTypeCounts, controlUnitResource) => {
        const controlUnitResourceTypeCount = previousControlUnitResourceTypeCounts[controlUnitResource.type] ?? 0
        previousControlUnitResourceTypeCounts[controlUnitResource.type] = controlUnitResourceTypeCount + 1

        return previousControlUnitResourceTypeCounts
      },
      {} as Record<string, number>
    )

  return !isEmpty(controlUnitResourceTypeCounts)
    ? Object.entries(controlUnitResourceTypeCounts).map(([type, count]) => (
        <Tag key={type} Icon={getIconFromControlUnitResourceType(type as ControlUnit.ControlUnitResourceType)} isLight>
          {`${count} ${pluralize(ControlUnit.ControlUnitResourceTypeLabel[type], count)}`}
        </Tag>
      ))
    : [<Tag key="none">Aucun moyen</Tag>]
}
