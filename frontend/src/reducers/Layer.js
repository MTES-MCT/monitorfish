import LayersEnum from "../domain/layers";

const Layer = (state, action) => {
    switch (action.type) {
        case 'REPLACE_VESSELS_LAYER':
            const arrayWithoutVessels = state.layers.filter(layer => layer.className_ !== LayersEnum.VESSELS)
            return {
                ...state,
                layers: [...arrayWithoutVessels, action.payload]
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
        default:
            return state;
    }
};

export default Layer;
