import { NavigateTo } from '@features/Logbook/constants'
import { getVesselLogbook } from '@features/Logbook/useCases/getVesselLogbook'
import { setSelectedVesselSidebarTab } from '@features/Vessel/slice'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'

export const openVesselSidebarTab = (tab: VesselSidebarTab) => (dispatch, getState) => {
  const {
    fishingActivities: { fishingActivities, isLastVoyage },
    vessel: { selectedVesselIdentity }
  } = getState()
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
