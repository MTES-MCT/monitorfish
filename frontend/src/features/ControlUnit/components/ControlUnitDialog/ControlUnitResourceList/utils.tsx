import { ControlUnit, Icon, getControlUnitResourceCategoryFromType } from '@mtes-mct/monitor-ui'

export function getIconFromControlUnitResourceType(type: ControlUnit.ControlUnitResourceType) {
  const category = getControlUnitResourceCategoryFromType(type)

  switch (category) {
    case ControlUnit.ControlUnitResourceCategory.LAND:
      return Icon.Car

    case ControlUnit.ControlUnitResourceCategory.AIR:
      return Icon.Plane

    case ControlUnit.ControlUnitResourceCategory.SEA:
      return Icon.FleetSegment

    default:
      return undefined
  }
}
