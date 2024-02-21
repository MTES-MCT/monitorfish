import { FormError, FormErrorCode } from '@libs/FormError'
import { type Undefine } from '@mtes-mct/monitor-ui'
import { validateRequiredFormValues } from '@utils/validateRequiredFormValues'
import { difference, omit } from 'lodash'

import { MISSION_ACTION_FORM_VALUES_SKELETON } from './constants'
import { Mission } from '../../../../domain/entities/mission/types'
import { MissionAction } from '../../../../domain/types/missionAction'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { LegacyControlUnit } from 'domain/types/legacyControlUnit'

import MissionActionType = MissionAction.MissionActionType

/**
 *
 * @param missionId
 * @param actionsFormValues
 * @param originalMissionActions Mission actions as they were previous to the mission edition
 */
export function getMissionActionsDataFromMissionActionsFormValues(
  missionId: MissionAction.MissionAction['missionId'],
  actionsFormValues: MissionActionFormValues[],
  originalMissionActions: MissionAction.MissionAction[] = []
): {
  deletedMissionActionIds: number[]
  updatedMissionActionDatas: MissionAction.MissionActionData[]
} {
  const updatedMissionActionDatas = actionsFormValues.map((missionActionFormValues, index) => {
    const missionActionFormValuesWithAllProps = {
      ...MISSION_ACTION_FORM_VALUES_SKELETON,
      ...missionActionFormValues
    }

    const maybeValidMissionActionData = omit(missionActionFormValuesWithAllProps, [
      'isDraft',
      'isValid',
      'isVesselUnknown'
    ])
    const validMissionActionData = getValidMissionActionData(maybeValidMissionActionData as MissionActionFormValues)

    // We get the action `id` to know if the action is an update
    const id = originalMissionActions[index]?.id

    return {
      ...validMissionActionData,
      id,
      missionId
    }
  })

  const originalMissionActionIds = originalMissionActions.map(({ id }) => id)
  const updatedMissionActionIds = updatedMissionActionDatas
    .filter(({ id }) => typeof id === 'number')
    .map(({ id }) => id as number)
  const deletedMissionActionIds = difference(originalMissionActionIds, updatedMissionActionIds)

  return {
    deletedMissionActionIds,
    updatedMissionActionDatas
  }
}

export function getMissionDataFromMissionFormValues(mainFormValues: MissionMainFormValues): Mission.MissionData {
  if (!mainFormValues.startDateTimeUtc) {
    throw new FormError(mainFormValues, 'startDateTimeUtc', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  const missionBaseValues = omit(mainFormValues, ['controlUnits', 'isValid'])

  const validControlUnits = mainFormValues.controlUnits.map(getValidMissionDataControlUnit)
  const missionTypes = mainFormValues.missionTypes ?? []

  return {
    ...missionBaseValues,
    controlUnits: validControlUnits,
    isClosed: !!missionBaseValues.isClosed,
    missionSource: mainFormValues.missionSource ?? Mission.MissionSource.MONITORFISH,
    missionTypes
  }
}

export function getTitleFromMissionMainFormValues(
  mainFormValues: MissionMainFormValues,
  missionId: number | undefined
): string {
  return missionId
    ? `Mission ${mainFormValues.missionTypes
        ?.map(missionType => Mission.MissionTypeLabel[missionType])
        .join(' / ')} – ${mainFormValues.controlUnits
        .map(controlUnit => controlUnit.name?.replace('(historique)', ''))
        .join(', ')}`
    : `Nouvelle mission`
}

export function getUpdatedMissionFromMissionMainFormValues(
  missionId: Mission.Mission['id'],
  mainFormValues: MissionMainFormValues
): Mission.Mission {
  const missionData = getMissionDataFromMissionFormValues(mainFormValues)

  return {
    id: missionId,
    ...missionData
  }
}

export function isValidControlUnit(
  controlUnitFormValues: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
): controlUnitFormValues is LegacyControlUnit.LegacyControlUnit {
  const [, error] = validateRequiredFormValues(
    ['administration', 'id', 'isArchived', 'name', 'resources'],
    controlUnitFormValues as LegacyControlUnit.LegacyControlUnit
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
  maybeValidMissionDataControlUnit: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
): Mission.MissionData['controlUnits'][0] {
  const [validMissionDataControlUnit, formError] = validateRequiredFormValues(
    ['administration', 'id', 'isArchived', 'name', 'resources'],
    maybeValidMissionDataControlUnit as LegacyControlUnit.LegacyControlUnit
  )
  if (formError) {
    throw formError
  }

  return validMissionDataControlUnit
}
