import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { animateToExtent } from '@features/Map/slice'
import { selectSelectedVesselTrackRequest } from '@features/Vessel/selectors/trackRequest'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '@features/Vessel/slice'
import { vesselApi } from '@features/Vessel/vesselApi'
import { Level } from '@mtes-mct/monitor-ui'

import { displayBannerWarningFromAPIFeedback } from './displayBannerWarningFromAPIFeedback'

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
      const nextTrackRequest = trackRequest ?? selectSelectedVesselTrackRequest(getState())

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
  dispatch(updatingVesselTrackDepth())
}
