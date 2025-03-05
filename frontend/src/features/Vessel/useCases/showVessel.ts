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
  async dispatch => {
    const {
      vessel: { selectedVesselSidebarTab }
    } = getState()

    try {
      dispatch(getSidebarTabData(selectedVesselSidebarTab, vesselIdentity))

      dispatch(logbookActions.resetNextUpdate())
      dispatch(logbookActions.setIsLoading())
      dispatch(resetDisplayedLogbookMessageOverlays())
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
      break
    case VesselSidebarTab.IDENTITY:
      break
    case VesselSidebarTab.REPORTING:
      break
    case VesselSidebarTab.SUMMARY:
      break
    case VesselSidebarTab.VOYAGES:
      // The logbook data is fetched every time.
      break
    default: {
      break
    }
  }
}
