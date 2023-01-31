import { omit } from 'ramda'

import { Mission, MissionData, MissionSource } from '../../../domain/types/mission'
import { FormError } from '../../../libs/FormError'
import { hasMissingOrUndefinedValues } from '../../../utils/hasMissingOrUndefinedValues'

import type { MissionFormValues } from './MainForm/types'

/**
 * Are `<missionFormValues>` complete enough to be transformed into a `MissionData` type and sent to the API?
 */
export function isCompleteMissionFormValues(missionFormValues: MissionFormValues | undefined): boolean {
  try {
    if (!missionFormValues) {
      return false
    }

    getMissionDataFromMissionFormValues(missionFormValues)

    return true
  } catch (_) {
    return false
  }
}

export function isValidControlUnit(
  formResourceUnit: MissionFormValues['controlUnits'][0]
): formResourceUnit is Mission['controlUnits'][0] {
  return !hasMissingOrUndefinedValues(['administration', 'id', 'name', 'resources'], formResourceUnit)
}

export function getMissionDataFromMissionFormValues(missionFormValues: MissionFormValues): MissionData {
  if (!missionFormValues.dateTimeRangeUtc) {
    throw new FormError(missionFormValues, 'dateTimeRangeUtc')
  }

  const missionBaseValues = omit(['controlUnits', 'dateTimeRangeUtc'], missionFormValues)

  const validControlUnits = missionFormValues.controlUnits.filter(isValidControlUnit)
  if (validControlUnits.length !== missionFormValues.controlUnits.length) {
    throw new FormError(missionFormValues, 'controlUnits')
  }
  const [startDateTimeUtc, endDateTimeUtc] = missionFormValues.dateTimeRangeUtc
  const missionSource = MissionSource.MONITORFISH

  return {
    ...missionBaseValues,
    controlUnits: validControlUnits,
    endDateTimeUtc,
    envActions: undefined,
    isClosed: false,
    isDeleted: false,
    missionSource,
    startDateTimeUtc
  }
}

export function getUpdatedMissionFromMissionFormValues(
  missionId: Mission['id'],
  missionFormValues: MissionFormValues
): Mission {
  const missionData = getMissionDataFromMissionFormValues(missionFormValues)

  return {
    id: missionId,
    ...missionData
  }
}
