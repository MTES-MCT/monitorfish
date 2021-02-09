import showVesselTrackAndSidebar from "./showVesselTrackAndSidebar";

const updateVesselTrackAndSidebar = () => (dispatch, getState) => {
    const vessel = getState().vessel.selectedVesselFeatureAndIdentity
    if(vessel) {
        dispatch(showVesselTrackAndSidebar(vessel, false, true))
    }
}

export default updateVesselTrackAndSidebar