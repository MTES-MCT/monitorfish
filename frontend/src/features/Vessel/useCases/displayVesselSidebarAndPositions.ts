import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { doNotAnimate } from '@features/Map/slice'
import { loadingVessel, setSelectedVessel } from '@features/Vessel/slice'
import { vesselApi } from '@features/Vessel/vesselApi'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayBannerWarningFromAPIFeedback } from './displayBannerWarningFromAPIFeedback'
import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'
import { addSearchedVessel } from '../../../domain/shared_slices/Global'
import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'
import { getCustomOrDefaultTrackRequest } from '../types/vesselTrackDepth'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Show a specified vessel track on map and on the vessel right sidebar
 */
export const displayVesselSidebarAndPositions =
  (vesselIdentity: Vessel.VesselIdentity, isFromSearch: boolean): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const {
      map: { defaultVesselTrackDepth },
      vessel: { selectedVesselTrackRequest }
    } = getState()

    dispatch(setRightMapBoxDisplayed(undefined))
    dispatch(doNotAnimate(false))
    dispatch(loadingVessel(vesselIdentity))
    const nextTrackRequest = getCustomOrDefaultTrackRequest(selectedVesselTrackRequest, defaultVesselTrackDepth, false)

    if (isFromSearch) {
      dispatch(addSearchedVessel(vesselIdentity))
    }

    const { isTrackDepthModified, vesselAndPositions } = await dispatch(
      vesselApi.endpoints.getVesselAndPositions.initiate(
        { trackRequest: nextTrackRequest, vesselIdentity },
        RTK_FORCE_REFETCH_QUERY_OPTIONS
      )
    ).unwrap()

    dispatch(displayBannerWarningFromAPIFeedback(vesselAndPositions.positions, isTrackDepthModified, false))

    dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))
    dispatch(setSelectedVessel(vesselAndPositions))
  }
