import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '../../shared_slices/Vessel'
import { removeError, setError } from '../../shared_slices/Global'
import { animateToExtent, doNotAnimate } from '../../shared_slices/Map'
import { batch } from 'react-redux'
import { getTrackResponseError, getUTCFullDayTrackRequest } from '../../entities/vesselTrackDepth'
import { showFishingActivitiesOnMap } from '../../shared_slices/FishingActivities'
import { getVesselPositionsFromAPI } from '../../../api/vessel'

/**
 * Modify the vessel track depth on map
 * @function modifyVesselTrackDepth
 * @param {VesselIdentity} vesselIdentity
 * @param {TrackRequest} trackRequest
 * @param {boolean=} doNotRedrawFishingMessages
 * @param {boolean=} useFullDays
 */
const modifyVesselTrackDepth = (
  vesselIdentity,
  trackRequest,
  doNotRedrawFishingMessages = false,
  useFullDays = false) => (dispatch, getState) => {
  const fishingActivitiesAreShowedOnMap = getState().fishingActivities.fishingActivitiesAreShowedOnMap
  if (!vesselIdentity || !trackRequest) {
    return
  }

  dispatchUpdatingVessel(dispatch, true)

  trackRequest = useFullDays
    ? getUTCFullDayTrackRequest({ ...trackRequest })
    : trackRequest

  return getVesselPositionsFromAPI(vesselIdentity, trackRequest)
    .then(({ positions, trackDepthHasBeenModified }) => {
      const error = getTrackResponseError(
        positions,
        trackDepthHasBeenModified,
        false,
        trackRequest)
      if (error) {
        dispatch(setError(error))
      } else {
        dispatch(removeError())
      }

      batch(() => {
        console.log('saved', trackRequest)
        dispatch(setSelectedVesselCustomTrackRequest(trackRequest))
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
