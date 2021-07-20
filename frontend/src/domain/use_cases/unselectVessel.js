import { closeVesselSidebar } from '../reducers/Vessel'
import { IS_SELECTED_PROPERTY, Vessel } from '../entities/vessel'

const unselectVessel = () => (dispatch, getState) => {
  const {
    vesselsLayerSource,
    selectedVessel
  } = getState().vessel

  if (vesselsLayerSource && selectedVessel) {
    const feature = vesselsLayerSource.getFeatureById(Vessel.getVesselId(selectedVessel))
    if (feature) {
      feature.set(IS_SELECTED_PROPERTY, false)
    }

    dispatch(closeVesselSidebar())
  }
}

export default unselectVessel
