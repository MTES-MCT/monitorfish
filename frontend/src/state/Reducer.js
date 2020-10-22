import Layers from "../layers/LayersEnum";

const Reducer = (state, action) => {
    switch (action.type) {
        case 'REPLACE_SHIPS_LAYER':
            const arrayWithoutShips = state.layers.filter(layer => layer.className_ !== Layers.SHIPS)
            return {
                ...state,
                layers: [...arrayWithoutShips, action.payload]
            };
        case 'SHOW_LAYER':
            return {
                ...state,
                layerToShow: action.payload
            };
        case 'HIDE_LAYER':
            return {
                ...state,
                layerToHide: action.payload
            };
        case 'RESET_SHOW_LAYER':
            return {
                ...state,
                layerToShow: null
            };
        case 'RESET_HIDE_LAYER':
            return {
                ...state,
                layerToHide: null
            };
        case 'SET_LAYERS':
            return {
                ...state,
                layers: action.payload
            };
        case 'ADD_LAYER':
            return {
                ...state,
                layers: state.layers.concat(action.payload)
            };
        case 'REMOVE_LAYER':
            return {
                ...state,
                layers: state.layers.filter(layer => layer.className_ !== action.payload.className_)
            };
        case 'SET_ERROR':
            console.error(action.payload)
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
};

export default Reducer;
