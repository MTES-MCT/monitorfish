const Reducer = (state, action) => {
    switch (action.type) {
        case 'SHOW_SHIP_TRACK':
            return {
                ...state,
                previousShipTrackShowed: state.shipTrackToShow,
                shipTrackToShow: action.payload
            };
        case 'RESET_SHOW_SHIP_TRACK':
            return {
                ...state,
                previousShipTrackShowed: state.shipTrackToShow,
                shipTrackToShow: null
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
        case 'ANIMATE_TO_SHIP':
            return {
                ...state,
                shipToMoveOn: action.payload
            };
        default:
            return state;
    }
};

export default Reducer;
