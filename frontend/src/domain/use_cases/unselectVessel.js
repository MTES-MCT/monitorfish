import { VESSEL_SELECTOR_STYLE } from '../../layers/styles/featuresStyles'
import { closeVesselSidebar } from '../reducers/Vessel'

const unselectVessel = () => (dispatch, getState) => {
  removeSelectorStyleToSelectedVessel(getState)
  dispatch(closeVesselSidebar(false))
}

function removeSelectorStyleToSelectedVessel (getState) {
  const vessel = getState().vessel.selectedVesselFeatureAndIdentity
  if (vessel && vessel.feature) {
    const stylesWithoutVesselSelector = vessel.feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
    vessel.feature.setStyle([...stylesWithoutVesselSelector])
  }
}

export default unselectVessel
