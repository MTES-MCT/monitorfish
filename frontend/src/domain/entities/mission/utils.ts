import { Mission } from '@features/Mission/mission.types'
import { customDayjs } from '@mtes-mct/monitor-ui'

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
