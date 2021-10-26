import { FishingActivitiesTab, VesselSidebarTab } from '../entities/vessel'
import { setFishingActivitiesTab, showVesselSidebarTab } from '../shared_slices/Vessel'

const navigateToFishingActivity = id => (dispatch) => {
  console.log('called')
  dispatch(showVesselSidebarTab(VesselSidebarTab.VOYAGES))
  dispatch(setFishingActivitiesTab(FishingActivitiesTab.MESSAGES))

  setTimeout(() => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 1000)
}

export default navigateToFishingActivity
