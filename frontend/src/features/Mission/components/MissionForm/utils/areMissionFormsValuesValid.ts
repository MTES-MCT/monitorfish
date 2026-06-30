import { getValidMissionActionData, getValidMissionDataControlUnit } from '../utils'

import type { MissionActionFormValues, MissionMainFormValues } from '../types'

export function areMissionFormsValuesValid(
  mainFormValues: MissionMainFormValues,
  actionsFormValues: MissionActionFormValues[]
): boolean {
  try {
    actionsFormValues.forEach(actionFormValues => getValidMissionActionData(actionFormValues))
  } catch {
    return false
  }

  try {
    mainFormValues.controlUnits?.forEach(controlUnit => getValidMissionDataControlUnit(controlUnit))
  } catch {
    return false
  }

  return mainFormValues.isValid && !actionsFormValues.map(({ isValid }) => isValid).includes(false)
}
