import { logSoftError } from '@mtes-mct/monitor-ui'

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
    logSoftError({
      context: {
        actions,
        editedDraftActionIndex
      },
      isSideWindowError: true,
      message: '`missionActionFormValues` is undefined.',
      userMessage: "Une erreur est survenue pendant l'initialisation de la mission."
    })

    return undefined
  }

  return missionActionFormValues
}
