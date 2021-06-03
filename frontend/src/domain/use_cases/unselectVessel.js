import { closeVesselSidebar, setSelectedVesselWasHiddenByFilter } from '../reducers/Vessel'
import { TEMPORARY_VESSEL_TRACK, VESSEL_ICON_STYLE, VESSEL_SELECTOR_STYLE } from '../entities/vessel'
import { getVesselIconOpacity } from '../../layers/styles/featuresStyles'

const unselectVessel = () => (dispatch, getState) => {
  removeSelectorStyleToSelectedVesselAndRemoveFeatureIfTemporary(dispatch, getState)
  dispatch(closeVesselSidebar())
}

function removeSelectorStyleToSelectedVesselAndRemoveFeatureIfTemporary (dispatch, getState) {
  const vessel = getState().vessel.selectedVesselFeatureAndIdentity
  const selectedVesselWasHiddenByFilter = getState().vessel.selectedVesselWasHiddenByFilter

  if (vessel && vessel.feature) {
    const stylesWithoutVesselSelector = vessel.feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
    vessel.feature.setStyle([...stylesWithoutVesselSelector])

    if (vessel.feature.getId().includes(TEMPORARY_VESSEL_TRACK)) {
      getState().vessel.vesselsLayerSource.removeFeature(vessel.feature)
    }

    if (selectedVesselWasHiddenByFilter) {
      const foundStyle = vessel.feature.getStyle().find(style => style.zIndex_ === VESSEL_ICON_STYLE)
      foundStyle.getImage().setOpacity(0)
      dispatch(setSelectedVesselWasHiddenByFilter(false))
    }
  }
}

export default unselectVessel
