import { SeaFront } from '../../seaFront/constants'
import { Mission } from '../types'

export function seaFrontFilterFunction(mission: Mission.Mission, filter: SeaFront[]) {
  if (filter.length === 0) {
    return true
  }

  if (!mission.facade) {
    return false
  }

  return !!filter.includes(mission.facade)
}
