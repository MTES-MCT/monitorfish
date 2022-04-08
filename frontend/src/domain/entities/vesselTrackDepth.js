import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'

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

export const getVesselTrackDepthRequestFromDefaultTrackDepth = trackDepth => ({
  trackDepth: trackDepth,
  afterDateTime: null,
  beforeDateTime: null
})

export function getVesselTrackDepthRequest (newWantedTrackDepth, vesselCustomTrackDepth, defaultVesselTrackDepth) {
  const {
    trackDepth,
    afterDateTime,
    beforeDateTime
  } = { ...vesselCustomTrackDepth }
  const {
    wantedTrackDepth,
    wantedAfterDateTime,
    wantedBeforeDateTime
  } = { ...newWantedTrackDepth }

  if (wantedTrackDepth || (wantedAfterDateTime && wantedBeforeDateTime)) {
    return newWantedTrackDepth
  }

  return {
    trackDepth: trackDepth || defaultVesselTrackDepth,
    afterDateTime: afterDateTime,
    beforeDateTime: beforeDateTime
  }
}

export function getTrackDepthError (positions, trackDepthHasBeenModified, calledFromCron, vesselTrackDepthObject) {
  if (trackDepthHasBeenModifiedFromAPI(positions, trackDepthHasBeenModified, calledFromCron)) {
    return new NoDEPFoundError('Nous n\'avons pas trouvé de dernier DEP pour ce navire, nous affichons ' +
      'les positions des dernières 24 heures.')
  } else if (noPositionsFoundForVessel(positions, calledFromCron)) {
    return new NoPositionsFoundError('Nous n\'avons trouvé aucune position.')
  } else if (noPositionsFoundForEnteredDateTime(positions, vesselTrackDepthObject)) {
    return new NoPositionsFoundError('Nous n\'avons trouvé aucune position pour ces dates.')
  }

  return null
}

function noPositionsFoundForVessel (positions, updateShowedVessel) {
  return !positions?.length && !updateShowedVessel
}

function noPositionsFoundForEnteredDateTime (positions, vesselTrackDepthObject) {
  return !positions?.length && vesselTrackDepthObject
}

function trackDepthHasBeenModifiedFromAPI (positions, trackDepthHasBeenModified, updateShowedVessel) {
  return positions?.length && trackDepthHasBeenModified && !updateShowedVessel
}
