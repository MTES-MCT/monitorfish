import { closeVesselSidebar } from '../shared_slices/Vessel'
import { hideFishingActivitiesOnMap } from '../shared_slices/FishingActivities'
import { Vessel } from '../entities/vessel'

const unselectVessel = () => (dispatch, getState) => {
  const {
    vesselsLayerSource,
    selectedVessel
  } = getState().vessel

  if (vesselsLayerSource && selectedVessel) {
    const feature = vesselsLayerSource.getFeatureById(Vessel.getVesselId(selectedVessel))
    if (feature) {
      feature.set(Vessel.isSelectedProperty, false)
    }
  }

  dispatch(hideFishingActivitiesOnMap())
  dispatch(closeVesselSidebar())
}

export default unselectVessel
