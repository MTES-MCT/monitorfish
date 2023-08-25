import { FishingActivitiesTab, VesselSidebarTab } from '../../entities/vessel/vessel'
import { setFishingActivitiesTab } from '../../shared_slices/FishingActivities'
import { showVesselSidebarTab } from '../../shared_slices/Vessel'

const navigateToFishingActivity = id => (dispatch, getState) => {
  const {
    vesselSidebarTab
  } = getState().vessel

  const {
    fishingActivitiesTab
  } = getState().fishingActivities

  if (vesselSidebarTab === VesselSidebarTab.VOYAGES && fishingActivitiesTab === FishingActivitiesTab.MESSAGES) {
    const element = document.getElementById(id)
    if (element) {
      scrollTo(element)
      return
    }
  }

  if (vesselSidebarTab !== VesselSidebarTab.VOYAGES) {
    dispatch(showVesselSidebarTab(VesselSidebarTab.VOYAGES))
  }
  if (fishingActivitiesTab !== FishingActivitiesTab.MESSAGES) {
    dispatch(setFishingActivitiesTab(FishingActivitiesTab.MESSAGES))
  }

  const interval = setInterval(() => {
    const element = document.getElementById(id)
    if (element) {
      scrollTo(element)
      clearInterval(interval)
    }
  }, 100)
}

function scrollTo (element) {
  element.scrollIntoView()
}

export default navigateToFishingActivity
