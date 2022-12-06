import { MissionType } from '../../../domain/types/mission'

import type { Action, PartialAction, PartialAirControl, PartialSeaControl } from './types'

export const NEW_AIR_CONTROL_ACTION: PartialAirControl = {
  type: MissionType.AIR
}

export const NEW_SEA_CONTROL_ACTION: PartialSeaControl = {
  type: MissionType.SEA
}

export const NEW_ACTION_BY_TYPE: Record<Action['type'], PartialAction> = {
  [MissionType.AIR]: NEW_AIR_CONTROL_ACTION,
  [MissionType.SEA]: NEW_SEA_CONTROL_ACTION
}
