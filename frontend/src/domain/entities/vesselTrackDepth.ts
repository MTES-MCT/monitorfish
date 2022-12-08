import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'

import type { TrackRequest, TrackRequestPredefined, VesselPosition } from './vessel/types'

export enum VesselTrackDepth {
  CUSTOM = 'CUSTOM',
  LAST_DEPARTURE = 'LAST_DEPARTURE',
  ONE_DAY = 'ONE_DAY',
  ONE_MONTH = 'ONE_MONTH',
  ONE_WEEK = 'ONE_WEEK',
  THREE_DAYS = 'THREE_DAYS',
  THREE_WEEK = 'THREE_WEEK',
  TWELVE_HOURS = 'TWELVE_HOURS',
  TWO_DAYS = 'TWO_DAYS',
  TWO_WEEK = 'TWO_WEEK'
}

/**
 * Get the custom track request if defined or build a track request from the default track depth
 *
 * TODO We should be able to remove that.
 */
export const getCustomOrDefaultTrackRequest = (
  customTrackRequest: TrackRequest | null,
  defaultTrackDepth: TrackRequestPredefined['trackDepth'],
  fullDays: boolean
): TrackRequest => {
  if (customTrackRequest) {
    if (fullDays) {
      return getUTCFullDayTrackRequest({ ...customTrackRequest })
    }

    return customTrackRequest
  }

  return getTrackRequestFromTrackDepth(defaultTrackDepth)
}
/**
 * Get the `TrackRequest` object from the track depth
 * @param {VesselNS.TrackRequestPredefined['trackDepth']} trackDepth
 * @returns {VesselNS.TrackRequestPredefined} vessel track request
 */
export const getTrackRequestFromTrackDepth = trackDepth => ({
  afterDateTime: null,
  beforeDateTime: null,
  trackDepth
})

/**
 * Return either track depth or track date range depending on each other existence.
 *
 * TODO Is it still useful?
 */
export const getUTCFullDayTrackRequest = (trackRequest: TrackRequest): TrackRequest => {
  if (!trackRequest.afterDateTime && !trackRequest.beforeDateTime) {
    return getTrackRequestFromTrackDepth(trackRequest?.trackDepth)
  }

  return getTrackRequestFromDates(trackRequest.afterDateTime, trackRequest.beforeDateTime)
}
/**
 * Get the `TrackRequest` object from the custom track depth with dates range
 *
 * TODO We should be able to remove that.
 */
export const getTrackRequestFromDates = (afterDateTime: Date, beforeDateTime: Date): TrackRequest => ({
  afterDateTime,
  beforeDateTime,
  trackDepth: VesselTrackDepth.CUSTOM
})

export function throwCustomErrorFromAPIFeedback(
  positions: VesselPosition[],
  isTrackDepthModified: boolean,
  isCalledFromCron: boolean
) {
  if (trackDepthHasBeenModifiedFromAPI(positions, isTrackDepthModified, isCalledFromCron)) {
    throw new NoDEPFoundError(
      "Nous n'avons pas trouvé de dernier DEP pour ce navire, nous affichons " +
        'les positions des dernières 24 heures.'
    )
  }
  if (noPositionsFoundForVessel(positions, isCalledFromCron)) {
    throw new NoPositionsFoundError("Nous n'avons trouvé aucune position.")
  }
  if (noPositionsFoundForEnteredDateTime(positions)) {
    throw new NoPositionsFoundError("Nous n'avons trouvé aucune position pour ces dates.")
  }
}

function noPositionsFoundForVessel(positions, updateShowedVessel) {
  return !positions?.length && !updateShowedVessel
}

function noPositionsFoundForEnteredDateTime(positions) {
  return !positions?.length
}

function trackDepthHasBeenModifiedFromAPI(positions, isTrackDepthModified, updateShowedVessel) {
  return positions?.length && isTrackDepthModified && !updateShowedVessel
}
