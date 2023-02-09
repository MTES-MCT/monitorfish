import { omit } from 'ramda'

import { INITIAL_MISSION_CONTROL_UNIT } from './constants'
import { Mission } from '../../../domain/types/mission'
import { FormError } from '../../../libs/FormError'
import { dayjs } from '../../../utils/dayjs'
import { getUtcizedDayjs } from '../../../utils/getUtcizedDayjs'
import { hasMissingOrUndefinedValues } from '../../../utils/hasMissingOrUndefinedValues'

import type { MissionFormValues } from './types'
import type { MissionAction } from '../../../domain/types/missionAction'
import type { DateAsStringRange } from '@mtes-mct/monitor-ui'

export function getMissionDataFromMissionFormValues(missionFormValues: MissionFormValues): Mission.MissionData {
  if (!missionFormValues.dateTimeRangeUtc) {
    throw new FormError(missionFormValues, 'dateTimeRangeUtc')
  }

  const missionBaseValues = omit(['controlUnits', 'dateTimeRangeUtc'], missionFormValues)

  const validControlUnits = missionFormValues.controlUnits.filter(isValidControlUnit)
  if (!validControlUnits.length || validControlUnits.length !== missionFormValues.controlUnits.length) {
    throw new FormError(missionFormValues, 'controlUnits')
  }
  const [startDateTimeUtc, endDateTimeUtc] = missionFormValues.dateTimeRangeUtc
  const missionSource = Mission.MissionSource.MONITORFISH

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

export function getMissionFormInitialValues(
  mission: Mission.Mission | undefined,
  missionActions: MissionAction.MissionAction[]
): MissionFormValues {
  if (!mission) {
    const utcizedLocalDateAsDayjs = getUtcizedDayjs()
    const utcizedLocalDateAsString = utcizedLocalDateAsDayjs.toISOString()
    const utcizedLocalDateAsStringPlusOneHour = utcizedLocalDateAsDayjs.add(1, 'hour').toISOString()

    return {
      actions: [],
      controlUnits: [INITIAL_MISSION_CONTROL_UNIT],
      dateTimeRangeUtc: [utcizedLocalDateAsString, utcizedLocalDateAsStringPlusOneHour],
      missionType: Mission.MissionType.SEA
    }
  }

  const defaultEndDateAsStringUtc = dayjs(mission.startDateTimeUtc).add(1, 'hour').toISOString()
  const dateTimeRangeUtc: DateAsStringRange = [
    mission.startDateTimeUtc,
    mission.endDateTimeUtc ? mission.endDateTimeUtc : defaultEndDateAsStringUtc
  ]

  const missionActionsAsFormValues = missionActions.map(missionAction => ({
    ...missionAction,
    isDraft: false
  }))

  return {
    ...omit(['dateTimeRangeUtc'], mission),
    actions: missionActionsAsFormValues,
    dateTimeRangeUtc
  }
}

export function getUpdatedMissionFromMissionFormValues(
  missionId: Mission.Mission['id'],
  missionFormValues: MissionFormValues
): Mission.Mission {
  const missionData = getMissionDataFromMissionFormValues(missionFormValues)

  return {
    id: missionId,
    ...missionData
  }
}

/**
 * Are `<missionFormValues>` complete enough to be transformed into a `MissionData` type and sent to the API?
 */
export function isMissionFormValuesComplete(missionFormValues: MissionFormValues | undefined): boolean {
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
): formResourceUnit is Mission.Mission['controlUnits'][0] {
  return (
    !hasMissingOrUndefinedValues(['administration', 'id', 'name', 'resources'], formResourceUnit) &&
    (formResourceUnit.resources as Mission.Mission['controlUnits'][0]['resources']).length > 0
  )
}
