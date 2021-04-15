import showVesselTrackAndSidebar from "./showVesselTrackAndSidebar";

const updateVesselTrackAndSidebar = () => (dispatch, getState) => {
    // TODO This vessel state is not needed
    const vessel = getState().vessel.selectedVesselFeatureAndIdentity
    if(vessel) {
        dispatch(showVesselTrackAndSidebar(vessel, false, true))
    }
}

export default updateVesselTrackAndSidebar