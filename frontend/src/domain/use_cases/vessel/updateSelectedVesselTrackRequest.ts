import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { showFishingActivitiesOnMap } from '../../shared_slices/FishingActivities'
import { removeError, setError } from '../../shared_slices/Global'
import { animateToExtent, doNotAnimate } from '../../shared_slices/Map'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '../../shared_slices/Vessel'

import type { AppDispatch, RootState } from '../../../store'
import type { TrackRequest, VesselIdentity } from '../../entities/vessel/types'
import type { AnyAction } from '@reduxjs/toolkit'
import type { ThunkAction } from 'redux-thunk'

/**
 * Modify the vessel track depth on map
 */
export const updateSelectedVesselTrackRequest =
  (
    vesselIdentity: VesselIdentity,
    trackRequest: TrackRequest,
    withoutFishingMessagesRerendering: boolean = false
  ): ThunkAction<Promise<void>, RootState, undefined, AnyAction> =>
  async (dispatch, getState) => {
    try {
      const { areFishingActivitiesShowedOnMap } = getState().fishingActivities

      dispatchUpdatingVessel(dispatch, true)

      const { isTrackDepthModified, positions } = await getVesselPositionsFromAPI(vesselIdentity, trackRequest)
      throwCustomErrorFromAPIFeedback(positions, isTrackDepthModified, false)

      dispatch(removeError())
      dispatch(setSelectedVesselCustomTrackRequest(trackRequest))
      dispatch(updateSelectedVesselPositions(positions))
      if (areFishingActivitiesShowedOnMap && !withoutFishingMessagesRerendering) {
        dispatch(showFishingActivitiesOnMap())
      }
      dispatch(animateToExtent())
    } catch (error) {
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    }
  }

function dispatchUpdatingVessel(dispatch: AppDispatch, doNotAnimateBoolean: boolean) {
  dispatch(doNotAnimate(doNotAnimateBoolean))
  dispatch(removeError())
  dispatch(updatingVesselTrackDepth())
}
