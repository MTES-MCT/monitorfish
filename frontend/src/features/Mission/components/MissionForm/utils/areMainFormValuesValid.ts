import { getValidMissionDataControlUnit } from '../utils'

import type { MissionMainFormValues } from '../types'

export function areMainFormValuesValid(mainFormValues: MissionMainFormValues): boolean {
  try {
    mainFormValues.controlUnits?.forEach(controlUnit => getValidMissionDataControlUnit(controlUnit))
  } catch (e) {
    return false
  }

  return mainFormValues.isValid
}
