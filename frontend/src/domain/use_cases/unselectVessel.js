import {VESSEL_SELECTOR_STYLE} from "../../layers/styles/featuresStyles";
import {closeVesselBox} from "../reducers/Vessel";

const unselectVessel = () => (dispatch, getState) => {
    removeSelectorStyleToSelectedVessel(getState);
    dispatch(closeVesselBox(false))
}

function removeSelectorStyleToSelectedVessel(getState) {
    let feature = getState().vessel.selectedVesselFeature
    if (feature) {
        let stylesWithoutVesselSelector = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        feature.setStyle([...stylesWithoutVesselSelector]);
    }
}

export default unselectVessel