import { Mission } from '../types'

export function seaFrontFilterFunction(mission: Mission.Mission, filter: string[]) {
  if (filter.length === 0 || !mission.facade) {
    return true
  }

  return !!filter.includes(mission.facade)
}
