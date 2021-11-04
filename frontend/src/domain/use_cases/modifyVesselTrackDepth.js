import { getVesselPositionsFromAPI } from '../../api/fetch'
import { resetLoadingVessel, updateSelectedVesselPositions, updatingVesselTrackDepth } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { doNotAnimate } from '../shared_slices/Map'
import { batch } from 'react-redux'
import { getTrackDepthError, getVesselTrackDepth } from '../entities/vesselTrackDepth'
import { removeFishingActivitiesFromMap } from '../shared_slices/FishingActivities'

/**
 * Modify the vessel track depth on map
 * @function modifyVesselTrackDepth
 * @param {VesselIdentity} vesselIdentity
 * @param {VesselTrackDepth=} vesselTrackDepth
 */
const modifyVesselTrackDepth = (vesselIdentity, vesselTrackDepth) => (dispatch, getState) => {
  const {
    selectedVesselCustomTrackDepth
  } = getState().vessel

  const {
    fishingActivitiesAreShowedOnMap
  } = getState().fishingActivities

  dispatchUpdatingVessel(dispatch, true)

  const nextVesselTrackDepthObject = getVesselTrackDepth(
    vesselTrackDepth,
    selectedVesselCustomTrackDepth,
    getState().map.defaultVesselTrackDepth)

  if (fishingActivitiesAreShowedOnMap) {
    dispatch(removeFishingActivitiesFromMap())
  }

  getVesselPositionsFromAPI(vesselIdentity, nextVesselTrackDepthObject)
    .then(({ positions, trackDepthHasBeenModified }) => {
      const error = getTrackDepthError(
        positions,
        trackDepthHasBeenModified,
        false,
        vesselTrackDepth)
      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      dispatch(updateSelectedVesselPositions(positions))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    })
}

function dispatchUpdatingVessel (dispatch, doNotAnimateBoolean) {
  batch(() => {
    dispatch(doNotAnimate(doNotAnimateBoolean))
    dispatch(removeError())
    dispatch(updatingVesselTrackDepth())
  })
}

export default modifyVesselTrackDepth
