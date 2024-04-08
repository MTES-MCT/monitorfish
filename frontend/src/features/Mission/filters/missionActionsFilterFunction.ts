import { Mission } from '@features/Mission/mission.types'

export function missionActionsFilterFunction(mission: Mission.MissionWithActions, withActions: boolean): boolean {
  if (!withActions) {
    return true
  }

  return mission.actions.length > 0
}
