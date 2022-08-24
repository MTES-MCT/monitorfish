import { batch } from 'react-redux'

import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { getTrackResponseError, getUTCFullDayTrackRequest } from '../../entities/vesselTrackDepth'
import { showFishingActivitiesOnMap } from '../../shared_slices/FishingActivities'
import { removeError, setError } from '../../shared_slices/Global'
import { animateToExtent, doNotAnimate } from '../../shared_slices/Map'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth,
} from '../../shared_slices/Vessel'

/**
 * Modify the vessel track depth on map
 * @function modifyVesselTrackDepth
 * @param {Vessel.VesselIdentity} vesselIdentity
 * @param {Vessel.TrackRequest} trackRequest
 * @param {boolean=} doNotRedrawFishingMessages
 * @param {boolean=} useFullDays
 */
const modifyVesselTrackDepth =
  (vesselIdentity, trackRequest, doNotRedrawFishingMessages = false, useFullDays = false) =>
  (dispatch, getState) => {
    const { fishingActivitiesAreShowedOnMap } = getState().fishingActivities
    if (!vesselIdentity || !trackRequest) {
      return undefined
    }

    dispatchUpdatingVessel(dispatch, true)

    trackRequest = useFullDays ? getUTCFullDayTrackRequest({ ...trackRequest }) : trackRequest

    return getVesselPositionsFromAPI(vesselIdentity, trackRequest)
      .then(({ positions, trackDepthHasBeenModified }) => {
        const error = getTrackResponseError(positions, trackDepthHasBeenModified, false, trackRequest)
        if (error && setError) {
          dispatch(setError(error))
        } else if (removeError) {
          dispatch(removeError(undefined))
        }

        batch(() => {
          dispatch(setSelectedVesselCustomTrackRequest(trackRequest))
          dispatch(updateSelectedVesselPositions(positions))
          if (fishingActivitiesAreShowedOnMap && !doNotRedrawFishingMessages) {
            dispatch(showFishingActivitiesOnMap(true))
          }
          dispatch(animateToExtent())
        })
      })
      .catch(error => {
        console.error(error)
        batch(() => {
          if (setError) {
            dispatch(setError(error))
          }
          dispatch(resetLoadingVessel())
        })
      })
  }

function dispatchUpdatingVessel(dispatch, doNotAnimateBoolean) {
  batch(() => {
    dispatch(doNotAnimate(doNotAnimateBoolean))
    if (removeError) {
      dispatch(removeError(undefined))
    }
    dispatch(updatingVesselTrackDepth())
  })
}

export default modifyVesselTrackDepth
