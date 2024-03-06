import { getValidMissionActionData } from '../utils'

import type { MissionActionFormValues } from '../types'

export function areMissionActionFormValuesValid(actionFormValues: MissionActionFormValues): boolean {
  try {
    getValidMissionActionData(actionFormValues)
  } catch (e) {
    return false
  }

  return true
}
