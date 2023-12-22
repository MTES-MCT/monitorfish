import { customDayjs } from '@mtes-mct/monitor-ui'

import { validateMissionForms } from './validateMissionForms'
import { Mission } from '../../../../domain/entities/mission/types'
import { MissionAction } from '../../../../domain/types/missionAction'
import { FrontendError } from '../../../../libs/FrontendError'
import { INITIAL_MISSION_CONTROL_UNIT } from '../constants'

import type { MissionActionFormValues, MissionMainFormValues } from '../types'

export function getMissionFormInitialValues(
  mission: Mission.Mission | undefined,
  missionActions: MissionAction.MissionAction[]
): {
  initialActionsFormValues: MissionActionFormValues[]
  initialMainFormValues: MissionMainFormValues
} {
  if (!mission) {
    const startDateTimeUtc = customDayjs().startOf('minute').toISOString()

    return {
      initialActionsFormValues: [],
      initialMainFormValues: {
        controlUnits: [INITIAL_MISSION_CONTROL_UNIT],
        isGeometryComputedFromControls: false,
        isValid: false,
        missionTypes: [Mission.MissionType.SEA],
        startDateTimeUtc
      }
    }
  }

  const missionType = mission.missionTypes[0]
  if (!missionType) {
    throw new FrontendError('`missionType` is undefined.')
  }

  const [, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(mission, missionActions, false)

  return {
    initialActionsFormValues: nextActionsFormValues,
    initialMainFormValues: nextMainFormValues
  }
}
