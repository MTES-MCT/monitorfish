import { Seafront } from '@constants/seafront'
import { Mission } from '@features/Mission/mission.types'

export function seafrontFilterFunction(mission: Mission.Mission, filter: Seafront[]) {
  if (filter.length === 0) {
    return true
  }

  if (!mission.facade) {
    return false
  }

  return !!filter.includes(mission.facade)
}
