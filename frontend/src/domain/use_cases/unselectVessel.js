import {VESSEL_SELECTOR_STYLE} from "../../layers/styles/featuresStyles";
import {closeVesselBox} from "../reducers/Vessel";

const unselectVessel = () => (dispatch, getState) => {
    removeSelectorStyleToSelectedVessel(getState);
    dispatch(closeVesselBox(false))
}

function removeSelectorStyleToSelectedVessel(getState) {
    let vessel = getState().vessel.selectedVesselFeatureAndIdentity
    if (vessel && vessel.feature) {
        let stylesWithoutVesselSelector = vessel.feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        vessel.feature.setStyle([...stylesWithoutVesselSelector]);
    }
}

export default unselectVessel