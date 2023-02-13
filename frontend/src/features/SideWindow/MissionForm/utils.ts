import { omit } from 'ramda'

import { INITIAL_MISSION_CONTROL_UNIT, MISSION_ACTION_FORM_VALUES_SKELETON } from './constants'
import { Mission } from '../../../domain/types/mission'
import { FormError, FormErrorCode } from '../../../libs/FormError'
import { dayjs } from '../../../utils/dayjs'
import { getUtcizedDayjs } from '../../../utils/getUtcizedDayjs'
import { validateRequiredFormValues } from '../../../utils/validateRequiredFormValues'

import type { MissionActionFormValues, MissionFormValues } from './types'
import type { MissionAction } from '../../../domain/types/missionAction'
import type { DateAsStringRange, Undefine } from '@mtes-mct/monitor-ui'

export function getMissionActionsDataFromMissionActionsFormValues(
  missionId: MissionAction.MissionAction['missionId'],
  missionActionsFormValues: MissionActionFormValues[]
): MissionAction.MissionActionData[] {
  return missionActionsFormValues.map(missionActionFormValues => {
    const missionActionFormValuesWithAllProps = {
      ...MISSION_ACTION_FORM_VALUES_SKELETON,
      ...missionActionFormValues
    }

    const maybeValidMissionActionData = omit(['isDraft'], missionActionFormValuesWithAllProps)
    const validMissionActionData = getValidMissionActionData(maybeValidMissionActionData)

    return {
      ...validMissionActionData,
      missionId
    }
  })
}

export function getMissionDataFromMissionFormValues(missionFormValues: MissionFormValues): Mission.MissionData {
  if (!missionFormValues.dateTimeRangeUtc) {
    throw new FormError(missionFormValues, 'dateTimeRangeUtc', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  const missionBaseValues = omit(
    ['actions', 'controlUnits', 'dateTimeRangeUtc', 'hasOrder', 'isUnderJdp'],
    missionFormValues
  )

  const validControlUnits = missionFormValues.controlUnits.map(getValidMissionDataControlUnit)
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
  controlUnitFormValues: MissionFormValues['controlUnits'][0]
): controlUnitFormValues is Mission.Mission['controlUnits'][0] {
  return (
    !validateRequiredFormValues(['administration', 'id', 'name', 'resources'], controlUnitFormValues) &&
    (controlUnitFormValues.resources as Mission.Mission['controlUnits'][0]['resources']).length > 0
  )
}

export function getValidMissionActionData(
  maybeValidMissionActionData: Omit<Undefine<MissionActionFormValues>, 'isDraft'>
): Omit<MissionAction.MissionActionData, 'missionId'> {
  const [validMissionActionData, formError] = validateRequiredFormValues(
    [
      'actionDatetimeUtc',
      'actionType',
      'controlUnits',
      'gearInfractions',
      'gearOnboard',
      'logbookInfractions',
      'otherInfractions',
      'segments',
      'speciesInfractions',
      'speciesOnboard',
      'vesselId',
      'vesselName'
    ],
    maybeValidMissionActionData
  )

  if (formError) {
    throw formError
  }

  return validMissionActionData
}

export function getValidMissionDataControlUnit(
  maybeValidMissionDataControlUnit: MissionFormValues['controlUnits'][0]
): Mission.MissionData['controlUnits'][0] {
  const [validMissionDataControlUnit, formError] = validateRequiredFormValues(
    ['administration', 'id', 'name', 'resources'],
    maybeValidMissionDataControlUnit
  )
  if (formError) {
    throw formError
  }

  return validMissionDataControlUnit
}
