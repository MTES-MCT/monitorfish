import {openVesselBox} from "../reducers/Vessel";
import {animateToVessel} from "../reducers/Map";

const showVesselBox = tabIndex => (dispatch, getState) => {
    let selectedVesselFeature = getState().vessel.selectedVesselFeature
    if(selectedVesselFeature) {
        dispatch(animateToVessel(selectedVesselFeature));
    }
    dispatch(openVesselBox(tabIndex))
}

export default showVesselBox