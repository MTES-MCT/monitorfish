import { getVesselFromAPI } from '../../api/fetch'
import { loadingVessel, openVesselSidebar, resetLoadingVessel, setSelectedVessel } from '../reducers/Vessel'
import { removeError, setError } from '../reducers/Global'
import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'
import { vesselsAreEquals } from '../entities/vessel'
import { setUpdatedFromCron } from '../reducers/Map'
import unselectVessel from './unselectVessel'

const showVesselTrackAndSidebar = (
  vesselFeatureAndIdentity,
  fromSearch,
  calledFromCron,
  vesselTrackDepthObject) => (dispatch, getState) => {
  const alreadySelectedVessel = getState().vessel.selectedVesselFeatureAndIdentity
  if (alreadyShownVesselFromSearch(calledFromCron, alreadySelectedVessel, vesselFeatureAndIdentity, fromSearch) &&
    getState().vessel.selectedVessel) {
      dispatch(openVesselSidebar())

    return
  }

  if(!calledFromCron &&
    alreadySelectedVessel &&
    !vesselsAreEquals(vesselFeatureAndIdentity.identity, alreadySelectedVessel.identity)) {
    dispatch(unselectVessel())
  }
  dispatch(setUpdatedFromCron(calledFromCron))

  dispatch(removeError())
  dispatch(loadingVessel({
    vesselFeatureAndIdentity: vesselFeatureAndIdentity,
    calledFromCron: calledFromCron
  }))
  dispatch(openVesselSidebar())

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    calledFromCron,
    vesselTrackDepthObject,
    getState().vessel.temporaryTrackDepth,
    getState().map.vesselTrackDepth)

  getVesselFromAPI(
    vesselFeatureAndIdentity.identity.internalReferenceNumber,
    vesselFeatureAndIdentity.identity.externalReferenceNumber,
    vesselFeatureAndIdentity.identity.ircs,
    nextVesselTrackDepthObject)
    .then(vesselAndTrackDepthModified => {
      if (trackDepthHasBeenModified(vesselAndTrackDepthModified, calledFromCron)) {
        dispatch(setError(new NoDEPFoundError("Nous n'avons pas trouvé de dernier DEP pour ce navire, nous affichons " +
                  'les positions des dernières 24 heures.')))
      } else if (noPositionsFoundForVessel(vesselAndTrackDepthModified, calledFromCron)) {
        dispatch(setError(new NoPositionsFoundError("Nous n'avons trouvé aucune position.")))
      } else if (noPositionsFoundForEnteredDateTime(vesselAndTrackDepthModified, vesselTrackDepthObject)) {
        dispatch(setError(new NoPositionsFoundError("Nous n'avons trouvé aucune position pour ces dates.")))
      } else {
        dispatch(removeError())
      }

      dispatch(setSelectedVessel(vesselAndTrackDepthModified.vessel))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

function alreadyShownVesselFromSearch (calledFromCron, alreadySelectedVessel, vesselFeatureAndIdentity, fromSearch) {
  return !calledFromCron &&
      fromSearch &&
      alreadySelectedVessel &&
      alreadySelectedVessel.feature === vesselFeatureAndIdentity.feature
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
