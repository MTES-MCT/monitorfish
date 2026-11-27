import { REPLAYED_TRACK_DEPTH_IN_HOURS } from '@features/PositionReplay/constants'
import {
  getTrackRequestFromDates,
  getTrackRequestFromTrackDepth,
  VesselTrackDepth
} from '@features/Vessel/types/vesselTrackDepth'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/types'
import type { TrackRequest } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { ManipulateType } from 'dayjs'

/** Mirrors the backend `GetDatesFromVesselTrackDepth`, which ends the predefined track depths now. */
const TRACK_DEPTH_DURATION: Record<
  Exclude<SelectableVesselTrackDepth, VesselTrackDepth.LAST_DEPARTURE>,
  [number, ManipulateType]
> = {
  [VesselTrackDepth.TWELVE_HOURS]: [12, 'hour'],
  [VesselTrackDepth.ONE_DAY]: [1, 'day'],
  [VesselTrackDepth.TWO_DAYS]: [2, 'day'],
  [VesselTrackDepth.THREE_DAYS]: [3, 'day'],
  [VesselTrackDepth.ONE_WEEK]: [1, 'week'],
  [VesselTrackDepth.TWO_WEEK]: [2, 'week'],
  [VesselTrackDepth.THREE_WEEK]: [3, 'week'],
  [VesselTrackDepth.ONE_MONTH]: [1, 'month']
}

/**
 * The default track of a replayed vessel: the hours before the replayed date, whatever the default track depth.
 */
export function getReplayedTrackRequest(positionsDateTime: string | undefined): TrackRequest | undefined {
  if (!positionsDateTime) {
    return undefined
  }

  const beforeDateTime = customDayjs(positionsDateTime)

  return getTrackRequestFromDates(
    beforeDateTime.subtract(REPLAYED_TRACK_DEPTH_IN_HOURS, 'hour').toDate(),
    beforeDateTime.toDate()
  )
}

/** The last departure is the one of the current trip. */
export function isTrackDepthAvailable(trackDepth: VesselTrackDepth, isPositionReplayActive: boolean): boolean {
  return !isPositionReplayActive || trackDepth !== VesselTrackDepth.LAST_DEPARTURE
}

export function getTrackRequestEndingAt(
  trackDepth: SelectableVesselTrackDepth,
  positionsDateTime: string | undefined
): TrackRequest {
  if (!positionsDateTime || trackDepth === VesselTrackDepth.LAST_DEPARTURE) {
    return getTrackRequestFromTrackDepth(trackDepth)
  }

  const beforeDateTime = customDayjs(positionsDateTime)
  const [amount, unit] = TRACK_DEPTH_DURATION[trackDepth]

  return getTrackRequestFromDates(beforeDateTime.subtract(amount, unit).toDate(), beforeDateTime.toDate())
}

/**
 * While replaying, a predefined track depth is requested as the dates ending at the replayed date:
 * finds it back to display it as selected.
 */
export function getSelectedTrackDepth(
  trackRequest: TrackRequest | undefined,
  positionsDateTime: string | undefined
): VesselTrackDepth | undefined {
  if (trackRequest?.trackDepth !== VesselTrackDepth.CUSTOM || !positionsDateTime) {
    return trackRequest?.trackDepth
  }

  const predefinedTrackDepth = (Object.keys(TRACK_DEPTH_DURATION) as Array<keyof typeof TRACK_DEPTH_DURATION>).find(
    trackDepth => {
      const predefinedTrackRequest = getTrackRequestEndingAt(trackDepth, positionsDateTime)

      return (
        customDayjs(predefinedTrackRequest.afterDateTime).isSame(trackRequest.afterDateTime) &&
        customDayjs(predefinedTrackRequest.beforeDateTime).isSame(trackRequest.beforeDateTime)
      )
    }
  )

  return predefinedTrackDepth ?? VesselTrackDepth.CUSTOM
}

export type LastVMSPosition = {
  course: number | undefined
  dateTime: string | undefined
  /** In seconds, between the two last VMS positions. */
  emissionPeriod: number | undefined
  latitude: number | undefined
  longitude: number | undefined
  speed: number | undefined
}

const VMS_POSITION_TYPE = 'VMS'

export function getLastVMSPositionOfTrack(positions: Vessel.VesselPosition[] | null): LastVMSPosition {
  const vmsPositions = (positions ?? [])
    .filter(position => position.positionType === VMS_POSITION_TYPE)
    .sort((a, b) => customDayjs(a.dateTime).valueOf() - customDayjs(b.dateTime).valueOf())
  const lastPosition = vmsPositions.at(-1)
  const previousPosition = vmsPositions.at(-2)

  return {
    course: lastPosition?.course,
    dateTime: lastPosition?.dateTime,
    emissionPeriod:
      lastPosition && previousPosition
        ? customDayjs(lastPosition.dateTime).diff(customDayjs(previousPosition.dateTime), 'second')
        : undefined,
    latitude: lastPosition?.latitude,
    longitude: lastPosition?.longitude,
    speed: lastPosition?.speed
  }
}
