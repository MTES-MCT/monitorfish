import * as Sentry from '@sentry/react'

import { FrontendError } from '../../../../libs/FrontendError'

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
    Sentry.captureException(new FrontendError('`missionActionFormValues` is undefined.'), {
      extra: {
        actions,
        editedDraftActionIndex
      }
    })

    return undefined
  }

  return missionActionFormValues
}
