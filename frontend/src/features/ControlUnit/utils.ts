import { ControlUnit } from '@mtes-mct/monitor-ui'

export function getControlUnitResourceCategoryFromControlUnitResourceType(
  type: ControlUnit.ControlUnitResourceType
): ControlUnit.ControlUnitResourceCategory | undefined {
  switch (type) {
    case ControlUnit.ControlUnitResourceType.CAR:
    case ControlUnit.ControlUnitResourceType.EQUESTRIAN:
    case ControlUnit.ControlUnitResourceType.MOTORCYCLE:
    case ControlUnit.ControlUnitResourceType.PEDESTRIAN:
      return ControlUnit.ControlUnitResourceCategory.LAND

    case ControlUnit.ControlUnitResourceType.AIRPLANE:
    case ControlUnit.ControlUnitResourceType.DRONE:
    case ControlUnit.ControlUnitResourceType.HELICOPTER:
      return ControlUnit.ControlUnitResourceCategory.AIR

    case ControlUnit.ControlUnitResourceType.BARGE:
    case ControlUnit.ControlUnitResourceType.FAST_BOAT:
    case ControlUnit.ControlUnitResourceType.FRIGATE:
    case ControlUnit.ControlUnitResourceType.HYDROGRAPHIC_SHIP:
    case ControlUnit.ControlUnitResourceType.KAYAK:
    case ControlUnit.ControlUnitResourceType.LIGHT_FAST_BOAT:
    case ControlUnit.ControlUnitResourceType.MINE_DIVER:
    case ControlUnit.ControlUnitResourceType.NET_LIFTER:
    case ControlUnit.ControlUnitResourceType.PATROL_BOAT:
    case ControlUnit.ControlUnitResourceType.PIROGUE:
    case ControlUnit.ControlUnitResourceType.RIGID_HULL:
    case ControlUnit.ControlUnitResourceType.SEA_SCOOTER:
    case ControlUnit.ControlUnitResourceType.SEMI_RIGID:
    case ControlUnit.ControlUnitResourceType.SUPPORT_SHIP:
    case ControlUnit.ControlUnitResourceType.TRAINING_SHIP:
    case ControlUnit.ControlUnitResourceType.TUGBOAT:
      return ControlUnit.ControlUnitResourceCategory.SEA

    case ControlUnit.ControlUnitResourceType.NO_RESOURCE:
    case ControlUnit.ControlUnitResourceType.OTHER:
    default:
      return undefined
  }
}
