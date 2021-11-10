import { getVesselPositionsFromAPI } from '../../api/fetch'
import { resetLoadingVessel, updateSelectedVesselPositions, updatingVesselTrackDepth } from '../shared_slices/Vessel'
import { removeError, setError } from '../shared_slices/Global'
import { animateToExtent, doNotAnimate } from '../shared_slices/Map'
import { batch } from 'react-redux'
import { getTrackDepthError } from '../entities/vesselTrackDepth'
import { showFishingActivitiesOnMap } from '../shared_slices/FishingActivities'
import { convertToUTCFullDay } from '../../utils'

/**
 * Modify the vessel track depth on map
 * @function modifyVesselTrackDepth
 * @param {VesselIdentity} vesselIdentity
 * @param {VesselTrackDepth=} vesselTrackDepth
 * @param {boolean=} doNotRedrawFishingMessages
 * @param {boolean=} useFullDays
 */
const modifyVesselTrackDepth = (vesselIdentity, vesselTrackDepth, doNotRedrawFishingMessages = false, useFullDays = false) => (dispatch, getState) => {
  const fishingActivitiesAreShowedOnMap = getState().fishingActivities.fishingActivitiesAreShowedOnMap
  if (!vesselIdentity || !vesselTrackDepth) {
    return
  }

  dispatchUpdatingVessel(dispatch, true)

  if (useFullDays) {
    const { afterDateTime, beforeDateTime } = convertToUTCFullDay(vesselTrackDepth.afterDateTime, vesselTrackDepth.beforeDateTime)
    vesselTrackDepth = {
      trackDepth: vesselTrackDepth.trackDepth,
      afterDateTime,
      beforeDateTime
    }
  }

  return getVesselPositionsFromAPI(vesselIdentity, vesselTrackDepth)
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

      batch(() => {
        dispatch(updateSelectedVesselPositions(positions))
        if (fishingActivitiesAreShowedOnMap && !doNotRedrawFishingMessages) {
          dispatch(showFishingActivitiesOnMap(true))
        }
        dispatch(animateToExtent())
      })
    }).catch(error => {
      console.error(error)
      batch(() => {
        dispatch(setError(error))
        dispatch(resetLoadingVessel())
      })
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
