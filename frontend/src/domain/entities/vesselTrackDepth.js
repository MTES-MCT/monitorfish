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

export function getVesselTrackDepth (newWantedTrackDepth, vesselCustomTrackDepth, defaultVesselTrackDepth) {
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

export function getTrackDepthError (vesselAndTrackDepthModified, calledFromCron, vesselTrackDepthObject) {
  if (trackDepthHasBeenModifiedFromAPI(vesselAndTrackDepthModified, calledFromCron)) {
    return new NoDEPFoundError('Nous n\'avons pas trouvé de dernier DEP pour ce navire, nous affichons ' +
      'les positions des dernières 24 heures.')
  } else if (noPositionsFoundForVessel(vesselAndTrackDepthModified, calledFromCron)) {
    return new NoPositionsFoundError('Nous n\'avons trouvé aucune position.')
  } else if (noPositionsFoundForEnteredDateTime(vesselAndTrackDepthModified, vesselTrackDepthObject)) {
    return new NoPositionsFoundError('Nous n\'avons trouvé aucune position pour ces dates.')
  }

  return null
}

function noPositionsFoundForVessel (vesselAndTrackDepthModified, updateShowedVessel) {
  return !vesselAndTrackDepthModified.vessel.positions?.length && !updateShowedVessel
}

function noPositionsFoundForEnteredDateTime (vesselAndTrackDepthModified, vesselTrackDepthObject) {
  return !vesselAndTrackDepthModified.vessel.positions?.length && vesselTrackDepthObject
}

function trackDepthHasBeenModifiedFromAPI (vesselAndTrackDepthModified, updateShowedVessel) {
  return vesselAndTrackDepthModified.trackDepthHasBeenModified &&
    !updateShowedVessel &&
    vesselAndTrackDepthModified.vessel.positions?.length
}
