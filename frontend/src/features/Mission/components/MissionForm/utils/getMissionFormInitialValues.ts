import { type MissionWithActions } from '../../../../../domain/entities/mission/types'
import { validateMissionForms } from '../../../../SideWindow/MissionForm/utils/validateMissionForms'

import type { MissionActionFormValues, MissionMainFormValues } from '../../../../SideWindow/MissionForm/types'

export function getMissionDraftFromMissionWithActions(missionWithActions: MissionWithActions): {
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
