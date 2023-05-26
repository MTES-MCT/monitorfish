import { logSoftError } from '../../../../libs/logSoftError'

import type { MissionActionFormValues } from '../types'

export function getInitialMissionActionFormValues(
  actions: MissionActionFormValues[] | undefined = [],
  editedDraftActionIndex: number | undefined = undefined
): MissionActionFormValues | undefined {
  if (editedDraftActionIndex === undefined) {
    return undefined
  }

  const missionActionFormValues = actions[editedDraftActionIndex]
  if (!missionActionFormValues) {
    logSoftError('`missionActionFormValues` is undefined.', {
      actions,
      editedDraftActionIndex
    })

    return undefined
  }

  return missionActionFormValues
}
