import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'

/** @type {Vessel.VesselTrackDepth} */
export const VesselTrackDepth = {
  LAST_DEPARTURE: 'LAST_DEPARTURE',
  TWELVE_HOURS: 'TWELVE_HOURS',
  ONE_DAY: 'ONE_DAY',
  TWO_DAYS: 'TWO_DAYS',
  THREE_DAYS: 'THREE_DAYS',
  ONE_WEEK: 'ONE_WEEK',
  TWO_WEEK: 'TWO_WEEK',
  THREE_WEEK: 'THREE_WEEK',
  ONE_MONTH: 'ONE_MONTH',
  CUSTOM: 'CUSTOM'
}

/**
 * Get the custom track request if defined or build a track request from the default track depth

 * @param {Vessel.TrackRequest | null} customTrackRequest - The custom track request
 * @param {string} defaultTrackDepth - The default vessel track depth
 * @param {boolean} fullDays - If full days are shown
 * @returns {Vessel.TrackRequest} vessel track request
 */
export const getCustomOrDefaultTrackRequest = (customTrackRequest, defaultTrackDepth, fullDays) => {
  if (customTrackRequest && trackRequestIsDefined(customTrackRequest)) {
    if (fullDays) {
      return getUTCFullDayTrackRequest({ ...customTrackRequest })
    } else {
      return customTrackRequest
    }
  }

  return getTrackRequestFromTrackDepth(defaultTrackDepth)
}

/** Returns true if the track request object is defined
 * @param {Vessel.TrackRequest | null} trackRequest
 * @return boolean
 */
export function trackRequestIsDefined (trackRequest) {
  return !!trackRequest?.trackDepth || (trackRequest?.afterDateTime && trackRequest?.beforeDateTime)
}

/**
 * Get the `TrackRequest` object from the track depth
 * @param {Omit<Vessel.VesselTrackDepthKey, 'CUSTOM'>} trackDepth
 * @returns {Vessel.TrackRequestPredefined} vessel track request
 */
export const getTrackRequestFromTrackDepth = trackDepth => ({
  trackDepth,
  afterDateTime: null,
  beforeDateTime: null
})

/**
 * Get the `TrackRequest` object from the custom track depth with dates range
 * @returns {Vessel.TrackRequest} vessel track request
 */
export const getTrackRequestFromDates = (afterDateTime, beforeDateTime) => ({
  trackDepth: VesselTrackDepth.CUSTOM,
  afterDateTime: afterDateTime,
  beforeDateTime: beforeDateTime
})

/**
 * Return either track depth or track date range depending on each other existence.
 *
 * @param {Vessel.TrackRequest} trackRequest - The vessel track depth request
 * @returns {Vessel.TrackRequest} vessel track request
 *
 * TODO Is it still useful?
 */
export const getUTCFullDayTrackRequest = trackRequest => {
  if (!trackRequest?.afterDateTime && !trackRequest?.beforeDateTime) {
    return getTrackRequestFromTrackDepth(trackRequest?.trackDepth)
  }

  return getTrackRequestFromDates(trackRequest?.afterDateTime, trackRequest?.beforeDateTime)
}

export function getTrackResponseError (positions, trackDepthHasBeenModified, calledFromCron, nextTrackRequest) {
  if (trackDepthHasBeenModifiedFromAPI(positions, trackDepthHasBeenModified, calledFromCron)) {
    return new NoDEPFoundError('Nous n\'avons pas trouvé de dernier DEP pour ce navire, nous affichons ' +
      'les positions des dernières 24 heures.')
  } else if (noPositionsFoundForVessel(positions, calledFromCron)) {
    return new NoPositionsFoundError('Nous n\'avons trouvé aucune position.')
  } else if (noPositionsFoundForEnteredDateTime(positions, nextTrackRequest)) {
    return new NoPositionsFoundError('Nous n\'avons trouvé aucune position pour ces dates.')
  }

  return null
}

function noPositionsFoundForVessel (positions, updateShowedVessel) {
  return !positions?.length && !updateShowedVessel
}

function noPositionsFoundForEnteredDateTime (positions, trackRequest) {
  return !positions?.length && trackRequest
}

function trackDepthHasBeenModifiedFromAPI (positions, trackDepthHasBeenModified, updateShowedVessel) {
  return positions?.length && trackDepthHasBeenModified && !updateShowedVessel
}
