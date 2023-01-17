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

import type { AppDispatch, AppThunk } from '../../../store'
import type { TrackRequest, VesselIdentity } from '../../entities/vessel/types'

/**
 * Modify the vessel track depth on map
 */
export const updateSelectedVesselTrackRequest =
  (
    vesselIdentity: VesselIdentity,
    trackRequest: TrackRequest,
    withoutFishingMessagesRerendering: boolean = false
  ): AppThunk =>
  async (dispatch, getState): Promise<void> => {
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
