import { customDayjs } from '@mtes-mct/monitor-ui'

import { Mission } from './types'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../../features/SideWindow/MissionForm/constants'
import { FrontendError } from '../../../libs/FrontendError'

import type { MissionFormValues } from '../../../features/SideWindow/MissionForm/types'
import type { MissionAction } from '../../types/missionAction'

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

export const getMissionStatus = ({
  endDateTimeUtc,
  isClosed,
  startDateTimeUtc
}: {
  endDateTimeUtc?: string
  isClosed?: Boolean
  startDateTimeUtc?: string
}): Mission.MissionStatus | undefined => {
  if (isClosed) {
    return Mission.MissionStatus.CLOSED
  }

  if (!startDateTimeUtc) {
    return undefined
  }

  const now = customDayjs()
  if (customDayjs(startDateTimeUtc).isAfter(now)) {
    return Mission.MissionStatus.UPCOMING
  }

  if (endDateTimeUtc && customDayjs(endDateTimeUtc).isBefore(now)) {
    return Mission.MissionStatus.DONE
  }

  return Mission.MissionStatus.IN_PROGRESS
}
