import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { animateToExtent, doNotAnimate } from '@features/Map/slice'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '@features/Vessel/slice'
import { getCustomOrDefaultTrackRequest } from '@features/Vessel/types/vesselTrackDepth'
import { vesselApi } from '@features/Vessel/vesselApi'
import { Level } from '@mtes-mct/monitor-ui'

import { displayBannerWarningFromAPIFeedback } from './displayBannerWarningFromAPIFeedback'
import { removeError, setError } from '../../../domain/shared_slices/Global'

import type { TrackRequest } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppDispatch, MainAppThunk } from '@store'

/**
 * Modify the vessel track depth on map
 */
export const updateSelectedVesselTrack =
  (vesselIdentity: Vessel.VesselIdentity, trackRequest?: TrackRequest): MainAppThunk =>
  async (dispatch, getState) => {
    try {
      const {
        map: { defaultVesselTrackDepth },
        vessel: { selectedVesselTrackRequest }
      } = getState()
      const nextTrackRequest =
        trackRequest ?? getCustomOrDefaultTrackRequest(selectedVesselTrackRequest, defaultVesselTrackDepth, false)

      dispatchIsUpdating(dispatch)

      const { isTrackDepthModified, positions } = await dispatch(
        vesselApi.endpoints.getVesselPositions.initiate(
          { trackRequest: nextTrackRequest, vesselIdentity },
          RTK_FORCE_REFETCH_QUERY_OPTIONS
        )
      ).unwrap()
      dispatch(displayBannerWarningFromAPIFeedback(positions, isTrackDepthModified, !!trackRequest))

      dispatch(setSelectedVesselCustomTrackRequest(nextTrackRequest))
      dispatch(updateSelectedVesselPositions(positions))

      if (trackRequest) {
        dispatch(animateToExtent())
      }
    } catch (error) {
      dispatch(setError(error))
      dispatch(
        addMainWindowBanner({
          children: (error as Error).message,
          closingDelay: 3000,
          isClosable: true,
          isFixed: true,
          level: Level.WARNING,
          withAutomaticClosing: true
        })
      )
      dispatch(resetLoadingVessel())
    }
  }

function dispatchIsUpdating(dispatch: MainAppDispatch) {
  dispatch(doNotAnimate(true))
  dispatch(removeError())
  dispatch(updatingVesselTrackDepth())
}
