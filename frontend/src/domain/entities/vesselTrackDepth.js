import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'

/** @type {VesselNS.VesselTrackDepth} */
export const VesselTrackDepth = {
  CUSTOM: 'CUSTOM',
  LAST_DEPARTURE: 'LAST_DEPARTURE',
  ONE_DAY: 'ONE_DAY',
  ONE_MONTH: 'ONE_MONTH',
  ONE_WEEK: 'ONE_WEEK',
  THREE_DAYS: 'THREE_DAYS',
  THREE_WEEK: 'THREE_WEEK',
  TWELVE_HOURS: 'TWELVE_HOURS',
  TWO_DAYS: 'TWO_DAYS',
  TWO_WEEK: 'TWO_WEEK',
}

/**
 * Get the custom track request if defined or build a track request from the default track depth

 * @param {VesselNS.TrackRequest | null} customTrackRequest - The custom track request
 * @param {VesselNS.TrackRequestPredefined['trackDepth']} defaultTrackDepth - The default vessel track depth
 * @param {boolean} fullDays - If full days are shown
 * @returns {VesselNS.TrackRequest} vessel track request
 */
export const getCustomOrDefaultTrackRequest = (customTrackRequest, defaultTrackDepth, fullDays) => {
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
  trackDepth,
})

/**
 * Get the `TrackRequest` object from the custom track depth with dates range
 * @returns {VesselNS.TrackRequest} vessel track request
 */
export const getTrackRequestFromDates = (afterDateTime, beforeDateTime) => ({
  afterDateTime,
  beforeDateTime,
  trackDepth: VesselTrackDepth.CUSTOM,
})

/**
 * Return either track depth or track date range depending on each other existence.
 *
 * @param {VesselNS.TrackRequest} trackRequest - The vessel track depth request
 * @returns {VesselNS.TrackRequest} vessel track request
 *
 * TODO Is it still useful?
 */
export const getUTCFullDayTrackRequest = trackRequest => {
  if (!trackRequest?.afterDateTime && !trackRequest?.beforeDateTime) {
    return getTrackRequestFromTrackDepth(trackRequest?.trackDepth)
  }

  return getTrackRequestFromDates(trackRequest?.afterDateTime, trackRequest?.beforeDateTime)
}

export function getTrackResponseError(positions, trackDepthHasBeenModified, calledFromCron, nextTrackRequest) {
  if (trackDepthHasBeenModifiedFromAPI(positions, trackDepthHasBeenModified, calledFromCron)) {
    return new NoDEPFoundError(
      "Nous n'avons pas trouvé de dernier DEP pour ce navire, nous affichons " +
        'les positions des dernières 24 heures.',
    )
  }
  if (noPositionsFoundForVessel(positions, calledFromCron)) {
    return new NoPositionsFoundError("Nous n'avons trouvé aucune position.")
  }
  if (noPositionsFoundForEnteredDateTime(positions, nextTrackRequest)) {
    return new NoPositionsFoundError("Nous n'avons trouvé aucune position pour ces dates.")
  }

  return null
}

function noPositionsFoundForVessel(positions, updateShowedVessel) {
  return !positions?.length && !updateShowedVessel
}

function noPositionsFoundForEnteredDateTime(positions, trackRequest) {
  return !positions?.length && trackRequest
}

function trackDepthHasBeenModifiedFromAPI(positions, trackDepthHasBeenModified, updateShowedVessel) {
  return positions?.length && trackDepthHasBeenModified && !updateShowedVessel
}
