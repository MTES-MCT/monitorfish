import { getVesselFromAPI } from '../../api/fetch'
import { loadingVessel, resetLoadingVessel, setSelectedVessel } from '../reducers/Vessel'
import { removeError, setError } from '../reducers/Global'
import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'
import { Vessel, vesselsAreEquals } from '../entities/vessel'
import { setUpdatedFromCron } from '../reducers/Map'
import unselectVessel from './unselectVessel'

const showVesselTrackAndSidebar = (
  vesselFeatureAndIdentity,
  fromSearch,
  calledFromCron,
  vesselTrackDepthObject) => (dispatch, getState) => {
  const alreadySelectedVessel = getState().vessel.selectedVesselFeatureAndIdentity
  unselectPreviousVessel(calledFromCron, alreadySelectedVessel, vesselFeatureAndIdentity, dispatch)

  if (vesselFeatureAndIdentity.feature) {
    Vessel.setVesselAsSelected(vesselFeatureAndIdentity.feature)
  }
  dispatchLoadingVessel(dispatch, calledFromCron, vesselFeatureAndIdentity)

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    calledFromCron,
    vesselTrackDepthObject,
    getState().vessel.temporaryTrackDepth,
    getState().map.vesselTrackDepth)

  getVesselFromAPI(vesselFeatureAndIdentity.identity, nextVesselTrackDepthObject)
    .then(vesselAndTrackDepthModified => {
      dispatchErrors(dispatch, vesselAndTrackDepthModified, calledFromCron, vesselTrackDepthObject)

      dispatch(setSelectedVessel(vesselAndTrackDepthModified.vessel))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

function dispatchLoadingVessel (dispatch, calledFromCron, vesselFeatureAndIdentity) {
  dispatch(setUpdatedFromCron(calledFromCron))
  dispatch(removeError())
  dispatch(loadingVessel({
    vesselFeatureAndIdentity: vesselFeatureAndIdentity,
    calledFromCron: calledFromCron
  }))
}

function unselectPreviousVessel (calledFromCron, alreadySelectedVessel, vesselFeatureAndIdentity, dispatch) {
  if (!calledFromCron &&
    alreadySelectedVessel &&
    !vesselsAreEquals(vesselFeatureAndIdentity.identity, alreadySelectedVessel.identity)) {
    dispatch(unselectVessel())
  }
}

function dispatchErrors (dispatch, vesselAndTrackDepthModified, calledFromCron, vesselTrackDepthObject) {
  if (trackDepthHasBeenModified(vesselAndTrackDepthModified, calledFromCron)) {
    dispatch(setError(new NoDEPFoundError('Nous n\'avons pas trouvé de dernier DEP pour ce navire, nous affichons ' +
      'les positions des dernières 24 heures.')))
  } else if (noPositionsFoundForVessel(vesselAndTrackDepthModified, calledFromCron)) {
    dispatch(setError(new NoPositionsFoundError('Nous n\'avons trouvé aucune position.')))
  } else if (noPositionsFoundForEnteredDateTime(vesselAndTrackDepthModified, vesselTrackDepthObject)) {
    dispatch(setError(new NoPositionsFoundError('Nous n\'avons trouvé aucune position pour ces dates.')))
  } else {
    dispatch(removeError())
  }
}

function getVesselTrackDepth (updateShowedVessel, trackDepthParameters, temporaryTrackDepth, vesselTrackDepth) {
  let nextTrackDepth, nextAfterDateTime, nextBeforeDateTime

  nextTrackDepth = temporaryTrackDepth.trackDepth ? temporaryTrackDepth.trackDepth : vesselTrackDepth
  nextAfterDateTime = temporaryTrackDepth.afterDateTime
  nextBeforeDateTime = temporaryTrackDepth.beforeDateTime

  if (updateShowedVessel) {
    nextTrackDepth = temporaryTrackDepth.trackDepth ? temporaryTrackDepth.trackDepth : vesselTrackDepth
    nextAfterDateTime = temporaryTrackDepth.afterDateTime
    nextBeforeDateTime = temporaryTrackDepth.beforeDateTime
  } else {
    if (!trackDepthParameters ||
      (!trackDepthParameters.trackDepth &&
        !trackDepthParameters.afterDateTime &&
        !trackDepthParameters.beforeDateTime)) {
      nextTrackDepth = vesselTrackDepth
    } else {
      return trackDepthParameters
    }
  }

  return {
    trackDepth: nextTrackDepth,
    afterDateTime: nextAfterDateTime,
    beforeDateTime: nextBeforeDateTime
  }
}

function noPositionsFoundForVessel (vesselAndTrackDepthModified, updateShowedVessel) {
  return vesselAndTrackDepthModified.vessel.positions &&
    !vesselAndTrackDepthModified.vessel.positions.length &&
    !updateShowedVessel
}

function noPositionsFoundForEnteredDateTime (vesselAndTrackDepthModified, vesselTrackDepthObject) {
  return vesselAndTrackDepthModified.vessel.positions &&
    !vesselAndTrackDepthModified.vessel.positions.length &&
    vesselTrackDepthObject
}

function trackDepthHasBeenModified (vesselAndTrackDepthModified, updateShowedVessel) {
  return vesselAndTrackDepthModified.trackDepthHasBeenModified &&
    !updateShowedVessel &&
    vesselAndTrackDepthModified.vessel.positions &&
    vesselAndTrackDepthModified.vessel.positions.length
}

export default showVesselTrackAndSidebar
