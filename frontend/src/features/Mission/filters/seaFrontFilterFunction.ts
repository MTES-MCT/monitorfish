import { SeaFront } from '@constants/seaFront'
import { Mission } from '@features/Mission/mission.types'

export function seaFrontFilterFunction(mission: Mission.Mission, filter: SeaFront[]) {
  if (filter.length === 0) {
    return true
  }

  if (!mission.facade) {
    return false
  }

  return !!filter.includes(mission.facade)
}
