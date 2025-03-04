import { NavigateTo } from '@features/Logbook/constants'
import { getVesselLogbook } from '@features/Logbook/useCases/getVesselLogbook'
import { setSelectedVesselSidebarTab } from '@features/Vessel/slice'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'

import { displayedErrorActions } from '../../../domain/shared_slices/DisplayedError'

export const openVesselSidebarTab = (tab: VesselSidebarTab) => (dispatch, getState) => {
  const {
    fishingActivities: { fishingActivities, isLastVoyage },
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
      if (!fishingActivities || isLastVoyage) {
        dispatch(getVesselLogbook(selectedVesselIdentity, NavigateTo.LAST, true))
      }
      break
    }
    default: {
      break
    }
  }

  dispatch(setSelectedVesselSidebarTab(tab))
}
