import { getValidMissionActionData, getValidMissionDataControlUnit } from '../utils'

import type { MissionActionFormValues, MissionMainFormValues } from '../types'

export function areMissionFormsValuesValid(
  mainFormValues: MissionMainFormValues | undefined,
  actionsFormValues: MissionActionFormValues[] = []
): boolean {
  try {
    actionsFormValues.forEach(actionFormValues => getValidMissionActionData(actionFormValues))
  } catch (e) {
    return false
  }

  try {
    mainFormValues?.controlUnits?.forEach(controlUnit => getValidMissionDataControlUnit(controlUnit))
  } catch (e) {
    return false
  }

  return !!mainFormValues && mainFormValues.isValid && !actionsFormValues.map(({ isValid }) => isValid).includes(false)
}
