import { animateToExtent, doNotAnimate } from '@features/Map/slice'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '@features/Vessel/slice'

import { getVesselPositionsFromAPI } from '../../../api/vessel'
import { logbookActions } from '../../../features/Logbook/slice'
import { throwCustomErrorFromAPIFeedback } from '../../entities/vesselTrackDepth'
import { removeError, setError } from '../../shared_slices/Global'

import type { MainAppDispatch, MainAppThunk } from '../../../store'
import type { TrackRequest } from '../../entities/vessel/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

/**
 * Modify the vessel track depth on map
 */
export const updateSelectedVesselTrackRequest =
  (
    vesselIdentity: Vessel.VesselIdentity,
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
