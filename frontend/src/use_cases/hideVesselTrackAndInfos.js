import {VESSEL_SELECTOR_STYLE} from "../layers/styles/featuresStyles";
import {closeVessel} from "../reducers/Vessel";

const hideVesselTrackAndInfos = () => (dispatch, getState) => {
    removeSelectorStyleToPreviousVessel(getState);
    dispatch(closeVessel())
}

function removeSelectorStyleToPreviousVessel(getState) {
    let feature = getState().vessel.selectedVesselFeature
    if (feature) {
        let stylesWithoutVesselSelector = feature.getStyle().filter(style => style.zIndex_ !== VESSEL_SELECTOR_STYLE)
        feature.setStyle([...stylesWithoutVesselSelector]);
    }
}

export default hideVesselTrackAndInfos