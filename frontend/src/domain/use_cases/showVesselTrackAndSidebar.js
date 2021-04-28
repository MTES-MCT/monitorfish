import { getVesselFromAPI } from '../../api/fetch'
import { selectedVesselStyle, VESSEL_SELECTOR_STYLE } from '../../layers/styles/featuresStyles'
import { loadingVessel, openVesselSidebar, resetLoadingVessel, setSelectedVessel } from '../reducers/Vessel'
import { animateToVessel } from '../reducers/Map'
import { removeError, setError } from '../reducers/Global'
import NoDEPFoundError from '../../errors/NoDEPFoundError'
import NoPositionsFoundError from '../../errors/NoPositionsFoundError'

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

  setLoadingAndAnimateToFeature(vesselFeatureAndIdentity, updateShowedVessel, dispatch)

  dispatch(openVesselSidebar())

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
        applySelectedStyleToVesselFeature(getState().vessel.selectedVesselFeatureAndIdentity.feature)
      } else if (noPositionsFoundForEnteredDateTime(vesselAndTrackDepthModified, vesselTrackDepthObject)) {
        dispatch(setError(new NoPositionsFoundError("Nous n'avons trouvé aucune position pour ces dates.")))
        applySelectedStyleToVesselFeature(getState().vessel.selectedVesselFeatureAndIdentity.feature)
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

function applySelectedStyleToVesselFeature (feature) {
  if (feature) {
    feature.setStyle([...feature.getStyle(), selectedVesselStyle])
  }
}

function alreadyShownVessel (updateShowedVessel, alreadySelectedVessel, vesselFeatureAndIdentity) {
  return !updateShowedVessel &&
      alreadySelectedVessel &&
      alreadySelectedVessel.feature === vesselFeatureAndIdentity.feature
}

function setLoadingAndAnimateToFeature (vesselFeatureAndIdentity, updateShowedVessel, dispatch) {
  if (!updateShowedVessel) {
    if (vesselFeatureAndIdentity.feature) {
      dispatch(animateToVessel(vesselFeatureAndIdentity.feature))
      dispatch(removeError())
    }

    dispatch(loadingVessel(vesselFeatureAndIdentity))
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

function removePreviousSelectedFeature (getState) {
  const previousSelectedFeatureAndIdentity = getState().vessel.selectedVesselFeatureAndIdentity
  if (previousSelectedFeatureAndIdentity && previousSelectedFeatureAndIdentity.feature) {
    const stylesWithoutVesselSelector = previousSelectedFeatureAndIdentity.feature.getStyle()
      .filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
    previousSelectedFeatureAndIdentity.feature.setStyle([...stylesWithoutVesselSelector])
  }
}

export default showVesselTrackAndSidebar
