import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { getVesselLogbookByDates } from '@features/Logbook/useCases/getVesselLogbookByDates'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { animateToExtent, doNotAnimate } from '@features/Map/slice'
import {
  resetLoadingVessel,
  setSelectedVesselCustomTrackRequest,
  updateSelectedVesselPositions,
  updatingVesselTrackDepth
} from '@features/Vessel/slice'
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
  (
    vesselIdentity: Vessel.VesselIdentity,
    trackRequest: TrackRequest,
    isCalledAfterLogbookFetch: boolean = false
  ): MainAppThunk =>
  async dispatch => {
    try {
      dispatchIsUpdating(dispatch)

      const { isTrackDepthModified, positions } = await dispatch(
        vesselApi.endpoints.getVesselPositions.initiate(
          { trackRequest, vesselIdentity },
          RTK_FORCE_REFETCH_QUERY_OPTIONS
        )
      ).unwrap()
      dispatch(displayBannerWarningFromAPIFeedback(positions, isTrackDepthModified, false))

      if (!isCalledAfterLogbookFetch) {
        await dispatch(getVesselLogbookByDates(vesselIdentity, trackRequest))
      }

      dispatch(removeError())
      dispatch(setSelectedVesselCustomTrackRequest(trackRequest))
      dispatch(updateSelectedVesselPositions(positions))
      dispatch(animateToExtent())
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
