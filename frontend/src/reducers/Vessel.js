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
        case 'SET_VESSEL_TRACK_VECTOR':
            return {
                ...state,
                vesselTrackVector: action.payload
            };
        case 'SET_VESSEL':
            return {
                ...state,
                vessel: action.payload
            };
        case 'SET_VESSELS':
            return {
                ...state,
                vessels: action.payload
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
