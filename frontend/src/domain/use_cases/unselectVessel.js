import { batch } from 'react-redux'
import { resetSelectedVessel, closeVesselSidebar } from '../shared_slices/Vessel'
import { hideFishingActivitiesOnMap } from '../shared_slices/FishingActivities'

const unselectVessel = () => (dispatch, getState) => {
  batch(() => {
    dispatch(resetSelectedVessel())
    dispatch(hideFishingActivitiesOnMap())
    dispatch(closeVesselSidebar())
  })
}

export default unselectVessel
