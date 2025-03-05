import { logbookActions } from '@features/Logbook/slice'
import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { resetDisplayedLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/resetDisplayedLogbookMessageOverlays'
import { getVesselLogbook } from '@features/Logbook/useCases/getVesselLogbook'
import { getVesselControls } from '@features/Vessel/components/VesselSidebar/useCases/getVesselControls'
import { resetLoadingVessel } from '@features/Vessel/slice'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'
import { displayVesselSidebarAndPositions } from '@features/Vessel/useCases/displayVesselSidebarAndPositions'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { MainAppThunk } from '@store'

/**
 * Show a specified vessel track, logbook and logbook message overlays on map
 */
export const showVessel =
  (vesselIdentity: Vessel.VesselIdentity, isFromSearch: boolean): MainAppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const {
      vessel: { selectedVesselSidebarTab }
    } = getState()

    try {
      dispatch(logbookActions.resetNextUpdate())
      dispatch(logbookActions.setIsLoading())
      dispatch(resetDisplayedLogbookMessageOverlays())

      dispatch(getSidebarTabData(selectedVesselSidebarTab, vesselIdentity))
      await dispatch(displayVesselSidebarAndPositions(vesselIdentity, isFromSearch))

      await dispatch(getVesselLogbook(vesselIdentity, undefined, true))
      await dispatch(displayLogbookMessageOverlays())
    } catch (error) {
      dispatch(
        displayOrLogError(
          error as Error,
          () => showVessel(vesselIdentity, isFromSearch),
          true,
          DisplayedErrorKey.VESSEL_SIDEBAR_ERROR
        )
      )
      dispatch(resetLoadingVessel())
    }
  }

const getSidebarTabData = (tab: VesselSidebarTab, vesselIdentity: Vessel.VesselIdentity) => dispatch => {
  switch (tab) {
    case VesselSidebarTab.CONTROLS: {
      dispatch(getVesselControls(vesselIdentity))
      break
    }
    case VesselSidebarTab.ERSVMS:
      // TODO Add the fetch here
      break
    case VesselSidebarTab.REPORTING:
      // TODO Add the fetch here
      break
    default: {
      break
    }
  }
}
