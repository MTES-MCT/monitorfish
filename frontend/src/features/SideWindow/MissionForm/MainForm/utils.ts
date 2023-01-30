import { INITIAL_MISSION_CONTROL_UNIT } from './constants'
import { MissionType } from '../../../../domain/types/mission'
import { getUtcizedDayjs } from '../../../../utils/getUtcizedDayjs'

import type { MissionFormValues } from './types'

export function getMissionFormInitialValues(): MissionFormValues {
  const utcizedLocalDate = getUtcizedDayjs()
  const utcizedLocalDatePlusOneHour = utcizedLocalDate.add(1, 'hour')

  return {
    controlUnits: [INITIAL_MISSION_CONTROL_UNIT],
    dateTimeRangeUtc: [utcizedLocalDate.toISOString(), utcizedLocalDatePlusOneHour.toISOString()],
    missionType: MissionType.SEA,
    zones: []
  }
}
