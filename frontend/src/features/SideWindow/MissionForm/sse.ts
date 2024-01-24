import type { Mission } from '../../../domain/entities/mission/types'

export const MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM = [
  // We do not update this field as it is not used by the form
  'updatedAtUtc',
  // We do not update this field as it is not used by the form
  'createdAtUtc',
  // TODO add the update of the env actions
  'envActions',
  // For internal validation only
  'isValid'
]

export const missionEventListener = (callback: (mission: Mission.Mission) => void) => (event: MessageEvent) => {
  const mission = JSON.parse(event.data) as Mission.Mission

  // eslint-disable-next-line no-console
  console.log(`SSE: received a mission update.`)

  if (import.meta.env.FRONTEND_MISSION_FORM_AUTO_UPDATE_ENABLED === 'false') {
    // eslint-disable-next-line no-console
    console.log(
      'Skipping automatic update of mission form. ' +
        "Set 'FRONTEND_MISSION_FORM_AUTO_UPDATE_ENABLED=true' feature flag to activate this feature."
    )

    return
  }

  callback(mission)
}
