import { closeVesselSidebar } from '../reducers/Vessel'
import { IS_SELECTED_PROPERTY } from '../../layers/VesselsLayer'

const unselectVessel = () => (dispatch, getState) => {
  const vessel = getState().vessel.selectedVesselFeatureAndIdentity

  if (vessel && vessel.feature) {
    vessel.feature.set(IS_SELECTED_PROPERTY, false)
  }
  dispatch(closeVesselSidebar())
}

export default unselectVessel
