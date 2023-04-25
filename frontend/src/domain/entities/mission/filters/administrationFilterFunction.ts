import { Mission } from '../types'

export function administrationFilterFunction(mission: Mission.Mission, filter: string[]) {
  if (filter.length === 0) {
    return true
  }

  return !!mission.controlUnits.find(controlUnit => {
    if (filter.find(adminFilter => adminFilter === controlUnit.administration)) {
      return controlUnit
    }

    return false
  })
}
