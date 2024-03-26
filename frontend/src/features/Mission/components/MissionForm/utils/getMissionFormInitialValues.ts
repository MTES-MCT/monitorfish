import { Mission } from '@features/Mission/mission.types'

import { validateMissionForms } from './validateMissionForms'

import type { MissionActionFormValues, MissionMainFormValues } from '../types'

export function getMissionDraftFromMissionWithActions(missionWithActions: Mission.MissionWithActions): {
  actionsFormValues: MissionActionFormValues[]
  mainFormValues: MissionMainFormValues
} {
  const { actions, ...mission } = missionWithActions

  const [, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(mission, actions, false)

  return {
    actionsFormValues: nextActionsFormValues,
    mainFormValues: nextMainFormValues
  }
}
