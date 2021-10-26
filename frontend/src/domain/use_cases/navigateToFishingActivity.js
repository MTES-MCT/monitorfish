import { FishingActivitiesTab, VesselSidebarTab } from '../entities/vessel'
import { setFishingActivitiesTab, showVesselSidebarTab } from '../shared_slices/Vessel'

const navigateToFishingActivity = id => (dispatch, getState) => {
  const {
    fishingActivitiesTab,
    vesselSidebarTab
  } = getState().vessel

  let domElementsAlreadyAvailable = true
  if (vesselSidebarTab !== VesselSidebarTab.VOYAGES) {
    domElementsAlreadyAvailable = false
    dispatch(showVesselSidebarTab(VesselSidebarTab.VOYAGES))
  }
  if (fishingActivitiesTab !== FishingActivitiesTab.MESSAGES) {
    domElementsAlreadyAvailable = false
    dispatch(setFishingActivitiesTab(FishingActivitiesTab.MESSAGES))
  }

  setTimeout(() => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, domElementsAlreadyAvailable ? 0 : 500)
}

export default navigateToFishingActivity
