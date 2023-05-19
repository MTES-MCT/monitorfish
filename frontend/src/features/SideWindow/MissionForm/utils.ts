import { customDayjs } from '@mtes-mct/monitor-ui'
import { difference } from 'lodash'
import { omit } from 'ramda'

import { INITIAL_MISSION_CONTROL_UNIT, MISSION_ACTION_FORM_VALUES_SKELETON } from './constants'
import { Mission } from '../../../domain/entities/mission/types'
import { MissionAction } from '../../../domain/types/missionAction'
import { FormError, FormErrorCode } from '../../../libs/FormError'
import { FrontendError } from '../../../libs/FrontendError'
import { validateRequiredFormValues } from '../../../utils/validateRequiredFormValues'

import type { MissionActionFormValues, MissionFormValues } from './types'
import type { ControlUnit } from '../../../domain/types/controlUnit'
import type { Undefine } from '@mtes-mct/monitor-ui'

import MissionActionType = MissionAction.MissionActionType

/**
 *
 * @param missionId
 * @param missionActionsFormValues
 * @param originalMissionActions Mission actions as they were previous to the mission edition
 */
export function getMissionActionsDataFromMissionActionsFormValues(
  missionId: MissionAction.MissionAction['missionId'],
  missionActionsFormValues: MissionActionFormValues[],
  originalMissionActions: MissionAction.MissionAction[] = []
): {
  deletedMissionActionIds: number[]
  updatedMissionActionDatas: MissionAction.MissionActionData[]
} {
  const updatedMissionActionDatas = missionActionsFormValues.map(missionActionFormValues => {
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

  const originalMissionActionIds = originalMissionActions.map(({ id }) => id as number)
  const updatedMissionActionIds = updatedMissionActionDatas
    .filter(({ id }) => typeof id === 'number')
    .map(({ id }) => id as number)
  const deletedMissionActionIds = difference(originalMissionActionIds, updatedMissionActionIds)

  return {
    deletedMissionActionIds,
    updatedMissionActionDatas
  }
}

/**
 * @param mustClose Should the mission be closed?
 */
export function getMissionDataFromMissionFormValues(
  missionFormValues: MissionFormValues,
  mustClose: boolean = false
): Mission.MissionData {
  if (!missionFormValues.startDateTimeUtc) {
    throw new FormError(missionFormValues, 'startDateTimeUtc', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  const missionBaseValues = omit(['actions', 'controlUnits'], missionFormValues)

  const validControlUnits = missionFormValues.controlUnits.map(getValidMissionDataControlUnit)
  const missionSource = Mission.MissionSource.MONITORFISH
  const missionTypes = missionFormValues.missionTypes || []

  return {
    ...missionBaseValues,
    controlUnits: validControlUnits,
    isClosed: mustClose || !!missionBaseValues.isClosed,
    missionSource,
    missionTypes
  }
}

export function getMissionFormInitialValues(
  mission: Mission.Mission | undefined,
  missionActions: MissionAction.MissionAction[]
): MissionFormValues {
  if (!mission) {
    const startDateTimeUtc = customDayjs().startOf('minute').toISOString()

    return {
      actions: [],
      controlUnits: [INITIAL_MISSION_CONTROL_UNIT],
      missionTypes: [Mission.MissionType.SEA],
      startDateTimeUtc
    }
  }

  const missionType = mission.missionTypes[0]
  if (!missionType) {
    throw new FrontendError('`missionType` is undefined.')
  }

  return {
    ...mission,
    actions: missionActions
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

    if (missionFormValues.actions?.length) {
      missionFormValues.actions.forEach(action => getValidMissionActionData(action))
    }

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
  if (
    maybeValidMissionActionData?.actionType === MissionActionType.AIR_CONTROL ||
    maybeValidMissionActionData?.actionType === MissionActionType.LAND_CONTROL ||
    maybeValidMissionActionData?.actionType === MissionActionType.SEA_CONTROL
  ) {
    const [validMissionActionData, formError] = validateRequiredFormValues(
      ['actionDatetimeUtc', 'actionType', 'vesselId', 'vesselName'],
      maybeValidMissionActionData
    )

    if (formError) {
      throw formError
    }

    return validMissionActionData
  }

  const [validMissionActionData, formError] = validateRequiredFormValues(
    ['actionDatetimeUtc', 'actionType'],
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
