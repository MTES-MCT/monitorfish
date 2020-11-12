const Reducer = (state, action) => {
    switch (action.type) {
        case 'SHOW_VESSEL_TRACK':
            return {
                ...state,
                previousVesselTrackShowed: state.vesselTrackToShow,
                vesselTrackToShow: action.payload
            };
        case 'RESET_SHOW_VESSEL_TRACK':
            return {
                ...state,
                previousVesselTrackShowed: state.vesselTrackToShow,
                vesselTrackToShow: null
            };
        case 'SET_VESSEL_TRACK':
            return {
                ...state,
                vesselTrack: action.payload
            };
        case 'REMOVE_VESSEL_TRACK':
            return {
                ...state,
                vesselTrack: action.payload
            };
        case 'ANIMATE_TO_VESSEL':
            return {
                ...state,
                vesselToMoveOn: action.payload
            };
        default:
            return state;
    }
};

export default Reducer;
