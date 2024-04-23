import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { logbookActions } from '../../../features/Logbook/slice'
import { removeError, setError } from '../../../features/MainWindow/slice'
import { throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { animateToExtent, doNotAnimate } from '../../shared_slices/Map'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '../../shared_slices/Vessel'

import type { MainAppDispatch, MainAppThunk } from '../../../store'
import type { TrackRequest, VesselIdentity } from '../../entities/vessel/types'

/**
 * Modify the vessel track depth on map
 */
export const updateSelectedVesselTrackRequest =
  (
    vesselIdentity: VesselIdentity,
    trackRequest: TrackRequest,
    withoutFishingMessagesRerendering: boolean = false
  ): MainAppThunk =>
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
        dispatch(logbookActions.showAllOnMap())
      }
      dispatch(animateToExtent())
    } catch (error) {
      dispatch(setError(error))
      dispatch(resetLoadingVessel())
    }
  }

function dispatchUpdatingVessel(dispatch: MainAppDispatch, doNotAnimateBoolean: boolean) {
  dispatch(doNotAnimate(doNotAnimateBoolean))
  dispatch(removeError())
  dispatch(updatingVesselTrackDepth())
}
