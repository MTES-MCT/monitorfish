import { batch } from 'react-redux'

import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { getTrackResponseError } from '../../entities/vesselTrackDepth'
import { showFishingActivitiesOnMap } from '../../shared_slices/FishingActivities'
import { removeError, setError } from '../../shared_slices/Global'
import { animateToExtent, doNotAnimate } from '../../shared_slices/Map'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '../../shared_slices/Vessel'

import type { AppDispatch, AppGetState } from '../../../store'
import type { TrackRequest, VesselIdentity } from '../../entities/vessel/types'

/**
 * Modify the vessel track depth on map
 */
export const updateSelectedVesselTrackRequest =
  (vesselIdentity: VesselIdentity, trackRequest: TrackRequest, withoutFishingMessagesRerendering: boolean = false) =>
  async (dispatch: AppDispatch, getState: AppGetState): Promise<void> => {
    try {
      const { areFishingActivitiesShowedOnMap } = getState().fishingActivities

      dispatchUpdatingVessel(dispatch, true)

      const { positions, trackDepthHasBeenModified } = await getVesselPositionsFromAPI(vesselIdentity, trackRequest)
      const error = getTrackResponseError(positions, trackDepthHasBeenModified, false, trackRequest)
      if (error && setError) {
        dispatch(setError(error))

        return
      }
      dispatch(removeError())

      batch(() => {
        dispatch(setSelectedVesselCustomTrackRequest(trackRequest))
        dispatch(updateSelectedVesselPositions(positions))
        if (areFishingActivitiesShowedOnMap && !withoutFishingMessagesRerendering) {
          dispatch(showFishingActivitiesOnMap())
        }
        dispatch(animateToExtent())
      })
    } catch (error) {
      batch(() => {
        if (setError) {
          dispatch(setError(error))
        }
        dispatch(resetLoadingVessel())
      })
    }
  }

function dispatchUpdatingVessel(dispatch: AppDispatch, doNotAnimateBoolean: boolean) {
  batch(() => {
    dispatch(doNotAnimate(doNotAnimateBoolean))
    dispatch(removeError())
    dispatch(updatingVesselTrackDepth())
  })
}
