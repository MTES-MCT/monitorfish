import type { Mission } from '../../../domain/entities/mission/types'

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
