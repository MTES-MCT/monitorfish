import { customDayjs } from '@mtes-mct/monitor-ui'

import type { ReplayedVesselData } from '@features/PositionReplay/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

/** Same fallback as the backend for an unknown flag state. */
const UNKNOWN_FLAG_STATE = 'UNDEFINED'

export function getReplayedVessel(replayedVesselData: ReplayedVesselData): Vessel.ReplayedVessel {
  return {
    ...replayedVesselData,
    activityType: 'POSITION_BASED',
    coordinates: replayedVesselData.coordinates ?? null,
    emitsPositions: true,
    flagState: replayedVesselData.flagState ?? UNKNOWN_FLAG_STATE,
    isAtPort: replayedVesselData.isAtPort ?? false,
    isReplayed: true,
    lastPositionSentAt: customDayjs(replayedVesselData.dateTime).valueOf()
  }
}

export function isReplayedVessel(vessel: object): vessel is Vessel.ReplayedVessel {
  return 'isReplayed' in vessel
}
