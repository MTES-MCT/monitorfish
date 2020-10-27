const Reducer = (state, action) => {
    switch (action.type) {
        case 'SHOW_SHIP_TRACK':
            return {
                ...state,
                shipTrackInternalReferenceNumberToShow: action.payload
            };
        case 'RESET_SHOW_SHIP_TRACK':
            return {
                ...state,
                shipTrackInternalReferenceNumberToShow: null
            };
        case 'SET_SHIP_TRACK':
            return {
                ...state,
                shipTrack: action.payload
            };
        case 'REMOVE_SHIP_TRACK':
            return {
                ...state,
                shipTrack: action.payload
            };
        default:
            return state;
    }
};

export default Reducer;
