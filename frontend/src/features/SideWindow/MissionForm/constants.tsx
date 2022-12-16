import { MissionType } from '../../../domain/types/mission'

import type {
  PartialAction,
  PartialAirControl,
  PartialFreeNote,
  PartialGroundControl,
  PartialSeaControl
} from './types'

export const NEW_AIR_CONTROL_ACTION = (): PartialAirControl => ({
  startDate: new Date(),
  type: MissionType.AIR
})

export const NEW_GROUND_CONTROL_ACTION = (): PartialGroundControl => ({
  startDate: new Date(),
  type: MissionType.GROUND
})

export const NEW_SEA_CONTROL_ACTION = (): PartialSeaControl => ({
  startDate: new Date(),
  type: MissionType.SEA
})

export const NEW_FREE_NOTE_ACTION = (): PartialFreeNote => ({
  startDate: new Date(),
  type: undefined
})

export const NEW_ACTION_BY_TYPE: Record<MissionType | 'default', () => PartialAction> = {
  [MissionType.AIR]: NEW_AIR_CONTROL_ACTION,
  [MissionType.GROUND]: NEW_GROUND_CONTROL_ACTION,
  [MissionType.SEA]: NEW_SEA_CONTROL_ACTION,
  default: NEW_FREE_NOTE_ACTION
}
