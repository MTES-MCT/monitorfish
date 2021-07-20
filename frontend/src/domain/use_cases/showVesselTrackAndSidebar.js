import { getVesselFromAPI } from '../../api/fetch'
import { loadingVessel, resetLoadingVessel, setSelectedVessel } from '../reducers/Vessel'
import { removeError, setError } from '../reducers/Global'
import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'
import { IS_SELECTED_PROPERTY, Vessel, vesselsAreEquals } from '../entities/vessel'
import { setUpdatedFromCron } from '../reducers/Map'
import unselectVessel from './unselectVessel'

const showVesselTrackAndSidebar = (
  vesselIdentity,
  fromSearch,
  calledFromCron,
  vesselTrackDepthObject) => (dispatch, getState) => {
  const {
    vesselIdentity: alreadySelectedVessel,
    vesselsLayerSource
  } = getState().vessel
  unselectPreviousVessel(calledFromCron, alreadySelectedVessel, vesselIdentity, dispatch)

  const feature = vesselsLayerSource.getFeatureById(Vessel.getVesselId(vesselIdentity))
  if (feature) {
    feature.set(IS_SELECTED_PROPERTY, true)
  }
  dispatchLoadingVessel(dispatch, calledFromCron, vesselIdentity)

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    calledFromCron,
    vesselTrackDepthObject,
    getState().vessel.temporaryTrackDepth,
    getState().map.vesselTrackDepth)

  getVesselFromAPI(vesselIdentity, nextVesselTrackDepthObject)
    .then(vesselAndTrackDepthModified => {
      dispatchErrors(dispatch, vesselAndTrackDepthModified, calledFromCron, vesselTrackDepthObject)

      const vessel = { ...vesselAndTrackDepthModified.vessel, ...vesselIdentity }
      dispatch(setSelectedVessel(vessel))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

function dispatchLoadingVessel (dispatch, calledFromCron, vesselIdentity) {
  dispatch(setUpdatedFromCron(calledFromCron))
  dispatch(removeError())
  dispatch(loadingVessel({
    vesselIdentity,
    calledFromCron
  }))
}

function unselectPreviousVessel (calledFromCron, alreadySelectedVessel, vesselIdentity, dispatch) {
  if (!calledFromCron &&
    alreadySelectedVessel &&
    !vesselsAreEquals(vesselIdentity, alreadySelectedVessel.identity)) {
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
