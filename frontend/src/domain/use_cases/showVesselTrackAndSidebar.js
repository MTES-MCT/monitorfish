import { getVesselFromAPI } from '../../api/fetch'
import { loadingVessel, openVesselSidebar, resetLoadingVessel, setSelectedVessel } from '../reducers/Vessel'
import { removeError, setError } from '../reducers/Global'
import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'
import { VESSEL_SELECTOR_STYLE } from '../entities/vessel'
import { animateToVessel } from '../reducers/Map'

const showVesselTrackAndSidebar = (
  vesselFeatureAndIdentity,
  fromSearch,
  updateShowedVessel,
  vesselTrackDepthObject) => (dispatch, getState) => {
  const alreadySelectedVessel = getState().vessel.selectedVesselFeatureAndIdentity
  if (alreadyShownVessel(updateShowedVessel, alreadySelectedVessel, vesselFeatureAndIdentity)) {
    if (getState().vessel.selectedVessel) {
      dispatch(openVesselSidebar())
    }

    return
  }

  removePreviousSelectedFeature(getState)

  dispatch(removeError())
  dispatch(loadingVessel(vesselFeatureAndIdentity))
  dispatch(openVesselSidebar())
  if (!updateShowedVessel) {
    dispatch(animateToVessel(true))
  }

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    updateShowedVessel,
    vesselTrackDepthObject,
    getState().vessel.temporaryTrackDepth,
    getState().map.vesselTrackDepth)

  getVesselFromAPI(
    vesselFeatureAndIdentity.identity.internalReferenceNumber,
    vesselFeatureAndIdentity.identity.externalReferenceNumber,
    vesselFeatureAndIdentity.identity.ircs,
    nextVesselTrackDepthObject)
    .then(vesselAndTrackDepthModified => {
      if (trackDepthHasBeenModified(vesselAndTrackDepthModified, updateShowedVessel)) {
        dispatch(setError(new NoDEPFoundError("Nous n'avons pas trouvé de dernier DEP pour ce navire, nous affichons " +
                  'les positions des dernières 24 heures.')))
      } else if (noPositionsFoundForVessel(vesselAndTrackDepthModified, updateShowedVessel)) {
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

function alreadyShownVessel (updateShowedVessel, alreadySelectedVessel, vesselFeatureAndIdentity) {
  return !updateShowedVessel &&
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

function removePreviousSelectedFeature (getState) {
  const previousSelectedFeatureAndIdentity = getState().vessel.selectedVesselFeatureAndIdentity

  if (previousSelectedFeatureAndIdentity && previousSelectedFeatureAndIdentity.feature) {
    const stylesWithoutVesselSelector = previousSelectedFeatureAndIdentity.feature.getStyle()
      .filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
    previousSelectedFeatureAndIdentity.feature.setStyle([...stylesWithoutVesselSelector])
  }
}

export default showVesselTrackAndSidebar
