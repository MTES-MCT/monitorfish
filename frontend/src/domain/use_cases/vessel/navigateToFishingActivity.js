import { setSelectedVesselSidebarTab } from '@features/Vessel/slice.ts'

import { logbookActions } from '../../../features/Logbook/slice'
import { FishingActivitiesTab, VesselSidebarTab } from '../../entities/vessel/vessel'

const navigateToFishingActivity = id => (dispatch, getState) => {
  const { selectedVesselSidebarTab } = getState().vessel

  const { fishingActivitiesTab } = getState().fishingActivities

  if (selectedVesselSidebarTab === VesselSidebarTab.VOYAGES && fishingActivitiesTab === FishingActivitiesTab.MESSAGES) {
    const element = document.getElementById(id)
    if (element) {
      scrollTo(element)

      return
    }
  }

  if (selectedVesselSidebarTab !== VesselSidebarTab.VOYAGES) {
    dispatch(setSelectedVesselSidebarTab(VesselSidebarTab.VOYAGES))
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

export default navigateToFishingActivity
