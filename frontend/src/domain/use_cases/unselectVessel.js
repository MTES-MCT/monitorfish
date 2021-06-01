import { closeVesselSidebar } from '../reducers/Vessel'
import { TEMPORARY_VESSEL_TRACK, VESSEL_SELECTOR_STYLE } from '../entities/vessel'

const unselectVessel = () => (dispatch, getState) => {
  removeSelectorStyleToSelectedVesselAndRemoveFeatureIfTemporary(getState)
  dispatch(closeVesselSidebar())
}

function removeSelectorStyleToSelectedVesselAndRemoveFeatureIfTemporary (getState) {
  const vessel = getState().vessel.selectedVesselFeatureAndIdentity
  if (vessel && vessel.feature) {
    const stylesWithoutVesselSelector = vessel.feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
    vessel.feature.setStyle([...stylesWithoutVesselSelector])

    if (vessel.feature.getId().includes(TEMPORARY_VESSEL_TRACK)) {
      getState().vessel.vesselsLayerSource.removeFeature(vessel.feature)
    }
  }
}

export default unselectVessel
