import { logbookActions } from '@features/Logbook/slice'
import { getVesselLogbook } from '@features/Logbook/useCases/getVesselLogbook'
import { setSelectedVesselSidebarTab } from '@features/Vessel/slice'
import { VesselSidebarTab } from '@features/Vessel/types/vessel'

export const openVesselSidebarTab = (tab: VesselSidebarTab) => (dispatch, getState) => {
  const { selectedVesselIdentity } = getState().vessel

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
      dispatch(logbookActions.resetNextUpdate())
      dispatch(getVesselLogbook(false)(selectedVesselIdentity, undefined, true))
      break
    }
    default: {
      break
    }
  }

  dispatch(setSelectedVesselSidebarTab(tab))
}
