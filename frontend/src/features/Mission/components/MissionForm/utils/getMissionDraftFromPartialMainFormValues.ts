import { customDayjs } from '@mtes-mct/monitor-ui'
import { Mission } from 'domain/entities/mission/types'

import { INITIAL_MISSION_CONTROL_UNIT } from '../constants'

import type { MissionWithActionsDraft } from '../../../types'
import type { MissionMainFormValues } from '../types'

export function getMissionDraftFromPartialMainFormValues(
  partialMainFormValues: Partial<MissionMainFormValues>
): MissionWithActionsDraft {
  return {
    actionsFormValues: [],
    mainFormValues: {
      controlUnits: [INITIAL_MISSION_CONTROL_UNIT],
      isGeometryComputedFromControls: false,
      isValid: false,
      missionTypes: [Mission.MissionType.SEA],
      startDateTimeUtc: customDayjs().startOf('minute').toISOString(),
      ...partialMainFormValues
    }
  }
}