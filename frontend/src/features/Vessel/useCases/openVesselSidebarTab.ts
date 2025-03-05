import { NavigateTo } from '@features/Logbook/constants'
import { logbookActions } from '@features/Logbook/slice'
import { displayLogbookMessageOverlays } from '@features/Logbook/useCases/displayedLogbookOverlays/displayLogbookMessageOverlays'
import { getVesselLogbook } from '@features/Logbook/useCases/getVesselLogbook'
import { setSelectedVesselSidebarTab } from '@features/Vessel/slice'
import { FishingActivitiesTab, VesselSidebarTab } from '@features/Vessel/types/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'

export const openVesselSidebarTab = (tab: VesselSidebarTab) => async (dispatch, getState) => {
  const {
    fishingActivities: { areFishingActivitiesShowedOnMap, fishingActivities },
    vessel: { selectedVesselIdentity }
  } = getState()
  dispatch(displayedErrorActions.unset(DisplayedErrorKey.VESSEL_SIDEBAR_ERROR))

  switch (tab) {
    case VesselSidebarTab.CONTROLS:
      break
    case VesselSidebarTab.ERSVMS:
      break
    case VesselSidebarTab.IDENTITY:
      break
    case VesselSidebarTab.REPORTING:
      break
    case VesselSidebarTab.SUMMARY:
      break
    case VesselSidebarTab.VOYAGES: {
      dispatch(logbookActions.setTab(FishingActivitiesTab.SUMMARY))

      if (!fishingActivities) {
        await dispatch(getVesselLogbook(selectedVesselIdentity, NavigateTo.LAST, true))
      }

      if (areFishingActivitiesShowedOnMap) {
        await dispatch(displayLogbookMessageOverlays())
      }

      break
    }
    default: {
      break
    }
  }

  dispatch(setSelectedVesselSidebarTab(tab))
}
