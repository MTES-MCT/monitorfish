import { customDayjs, getUtcizedDayjs } from '@mtes-mct/monitor-ui'
import { omit } from 'ramda'

import { INITIAL_MISSION_CONTROL_UNIT, MISSION_ACTION_FORM_VALUES_SKELETON } from './constants'
import { Mission } from '../../../domain/entities/mission/types'
import { FormError, FormErrorCode } from '../../../libs/FormError'
import { FrontendError } from '../../../libs/FrontendError'
import { validateRequiredFormValues } from '../../../utils/validateRequiredFormValues'

import type { MissionActionFormValues, MissionFormValues } from './types'
import type { ControlUnit } from '../../../domain/types/controlUnit'
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

    const maybeValidMissionActionData = omit(['isDraft', 'isVesselUnknown'], missionActionFormValuesWithAllProps)
    const validMissionActionData = getValidMissionActionData(maybeValidMissionActionData)

    return {
      ...validMissionActionData,
      missionId
    }
  })
}

/**
 * @param mustClose Should the mission be closed?
 */
export function getMissionDataFromMissionFormValues(
  missionFormValues: MissionFormValues,
  mustClose: boolean = false
): Mission.MissionData {
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
  const missionTypes = missionFormValues.missionTypes || []

  return {
    ...missionBaseValues,
    controlUnits: validControlUnits,
    endDateTimeUtc,
    envActions: undefined,
    isClosed: mustClose || !!missionBaseValues.isClosed,
    isDeleted: false,
    missionSource,
    missionTypes,
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
      missionTypes: [Mission.MissionType.SEA]
    }
  }

  const defaultEndDateAsStringUtc = customDayjs(mission.startDateTimeUtc).add(1, 'hour').toISOString()
  const dateTimeRangeUtc: DateAsStringRange = [
    mission.startDateTimeUtc,
    mission.endDateTimeUtc ? mission.endDateTimeUtc : defaultEndDateAsStringUtc
  ]
  const missionType = mission.missionTypes[0]
  if (!missionType) {
    throw new FrontendError('`missionType` is undefined.')
  }

  return {
    ...mission,
    actions: missionActions,
    dateTimeRangeUtc
  }
}

/**
 * @param mustClose Should the mission be closed?
 */
export function getUpdatedMissionFromMissionFormValues(
  missionId: Mission.Mission['id'],
  missionFormValues: MissionFormValues,
  mustClose: boolean
): Mission.Mission {
  const missionData = getMissionDataFromMissionFormValues(missionFormValues, mustClose)

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
  controlUnitFormValues: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft
): controlUnitFormValues is ControlUnit.ControlUnit {
  const [, error] = validateRequiredFormValues(
    ['administration', 'id', 'isArchived', 'name', 'resources'],
    controlUnitFormValues as ControlUnit.ControlUnit
  )

  return !error
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
      'speciesOnboard'
    ],
    maybeValidMissionActionData
  )

  if (formError) {
    throw formError
  }

  return validMissionActionData
}

export function getValidMissionDataControlUnit(
  maybeValidMissionDataControlUnit: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft
): Mission.MissionData['controlUnits'][0] {
  const [validMissionDataControlUnit, formError] = validateRequiredFormValues(
    ['administration', 'id', 'isArchived', 'name', 'resources'],
    maybeValidMissionDataControlUnit as ControlUnit.ControlUnit
  )
  if (formError) {
    throw formError
  }

  return validMissionDataControlUnit
}
