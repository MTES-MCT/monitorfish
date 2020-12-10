import {VESSEL_SELECTOR_STYLE} from "../layers/styles/featuresStyles";
import {closeVesselSummary} from "../reducers/Vessel";

const hideVesselSummary = () => (dispatch, getState) => {
    const keepSelectedVessel = true
    if(!getState().vessel.vesselBoxIsOpen) {
        removeSelectorStyleToSelectedVessel(getState);
        dispatch(closeVesselSummary(!keepSelectedVessel))
        return
    }

    dispatch(closeVesselSummary(keepSelectedVessel))
}

function removeSelectorStyleToSelectedVessel(getState) {
    let feature = getState().vessel.selectedVesselFeature
    if (feature) {
        let stylesWithoutVesselSelector = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        feature.setStyle([...stylesWithoutVesselSelector]);
    }
}

export default hideVesselSummary