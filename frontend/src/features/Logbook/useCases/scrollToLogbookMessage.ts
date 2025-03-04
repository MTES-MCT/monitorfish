import { vesselActions } from '@features/Vessel/slice'
import { FishingActivitiesTab, VesselSidebarTab } from '@features/Vessel/types/vessel'

import { logbookActions } from '../slice'

import type { MainAppThunk } from '@store'

export const scrollToLogbookMessage =
  (id: string): MainAppThunk =>
  (dispatch, getState) => {
    const { selectedVesselSidebarTab } = getState().vessel

    const { fishingActivitiesTab } = getState().fishingActivities

    if (
      selectedVesselSidebarTab === VesselSidebarTab.VOYAGES &&
      fishingActivitiesTab === FishingActivitiesTab.MESSAGES
    ) {
      const element = document.getElementById(id)
      if (element) {
        scrollTo(element)

        return
      }
    }

    if (selectedVesselSidebarTab !== VesselSidebarTab.VOYAGES) {
      dispatch(vesselActions.setSelectedVesselSidebarTab(VesselSidebarTab.VOYAGES))
    }
    if (fishingActivitiesTab !== FishingActivitiesTab.MESSAGES) {
      dispatch(logbookActions.setTab(FishingActivitiesTab.MESSAGES))
    }

    const interval = setInterval(() => {
      const element = document.getElementById(id)
      if (element) {
        scrollTo(element)
        clearInterval(interval)
      }
    }, 100)
  }

function scrollTo(element) {
  element.scrollIntoView()
}
