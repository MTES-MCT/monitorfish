import { customDayjs } from '@mtes-mct/monitor-ui'
import { logInDev } from '@utils/logInDev'
import { undefinedize } from '@utils/undefinedize'

import type { Mission } from '@features/Mission/mission.types'

export const MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM = [
  // We do not update this field as it is not used by the form
  'updatedAtUtc',
  // We do not update this field as it is not used by the form
  'createdAtUtc',
  // We do not update this field as it is not used by the form
  'envActions',
  // For internal validation only
  'isValid'
]

/** An event that is not strictly newer than our last save is either our own echo, or an outdated update. */
export function isMissionEventStale(
  missionEventUpdatedAtUtc: string | undefined,
  lastSavedUpdatedAtUtc: string | undefined
): boolean {
  if (!missionEventUpdatedAtUtc || !lastSavedUpdatedAtUtc) {
    return false
  }

  return !customDayjs(missionEventUpdatedAtUtc).isAfter(customDayjs(lastSavedUpdatedAtUtc))
}

export const missionEventListener = (callback: (mission: Mission.Mission) => void) => (event: MessageEvent) => {
  const mission = undefinedize(JSON.parse(event.data)) as Mission.Mission

  logInDev(`SSE: received a mission update.`)

  if (import.meta.env.FRONTEND_MISSION_FORM_AUTO_UPDATE_ENABLED === 'false') {
    logInDev(
      'Skipping automatic update of mission form. ' +
        "Set 'FRONTEND_MISSION_FORM_AUTO_UPDATE_ENABLED=true' feature flag to activate this feature."
    )

    return
  }

  callback(mission)
}
