import {VESSEL_SELECTOR_STYLE} from "../layers/styles/featuresStyles";
import {closeVesselBox, closeVesselSummary} from "../reducers/Vessel";

const hideVesselBox = () => (dispatch, getState) => {
    const keepSelectedVessel = true
    if(!getState().vessel.vesselSummaryIsOpen) {
        removeSelectorStyleToSelectedVessel(getState);
        dispatch(closeVesselBox(!keepSelectedVessel))
        return
    }

    dispatch(closeVesselBox(keepSelectedVessel))
}

function removeSelectorStyleToSelectedVessel(getState) {
    let feature = getState().vessel.selectedVesselFeature
    if (feature) {
        let stylesWithoutVesselSelector = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        feature.setStyle([...stylesWithoutVesselSelector]);
    }
}

export default hideVesselBox