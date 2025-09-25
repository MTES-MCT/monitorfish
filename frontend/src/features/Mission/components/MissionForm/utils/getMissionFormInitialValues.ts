import { Mission } from '@features/Mission/mission.types'

import { validateMissionForms } from './validateMissionForms'

import type { MissionActionFormValues, MissionMainFormValues } from '../types'
import type { MainAppDispatch } from '@store'

export function getMissionDraftFromMissionWithActions(
  missionWithActions: Mission.MissionWithActions,
  dispatch: MainAppDispatch
): {
  actionsFormValues: MissionActionFormValues[]
  mainFormValues: MissionMainFormValues
} {
  const { actions, ...mission } = missionWithActions

  const [, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(mission, actions, false, dispatch)

  return {
    actionsFormValues: nextActionsFormValues,
    mainFormValues: nextMainFormValues
  }
}
