import { closeVesselSidebar } from '../reducers/Vessel'
import { VESSEL_SELECTOR_STYLE } from '../entities/vessel'

const unselectVessel = () => (dispatch, getState) => {
  removeSelectorStyleToSelectedVesselAndRemoveFeatureIfTemporary(dispatch, getState)
  dispatch(closeVesselSidebar())
}

function removeSelectorStyleToSelectedVesselAndRemoveFeatureIfTemporary (dispatch, getState) {
  const vessel = getState().vessel.selectedVesselFeatureAndIdentity

  if (vessel && vessel.feature) {
    const stylesWithoutVesselSelector = vessel.feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
    vessel.feature.setStyle([...stylesWithoutVesselSelector])
  }
}

export default unselectVessel
