import {removeLayer, removeShowedLayer} from "../reducers/Layer";

const hideLayer = layerToHide => (dispatch, getState) => {
    if(layerToHide && layerToHide.type) {
        let layerToRemove
        switch (layerToHide.filter) {
            case undefined: layerToRemove = getState().layer.layers.find(layer => layer.className_ === layerToHide.type); break;
            default: {
                layerToRemove = getState().layer.layers.find(layer => layer.className_ === `${layerToHide.type}:${layerToHide.filter}`);
                break;
            }
        }

        if (layerToRemove) {
            dispatch(removeLayer(layerToRemove));
            dispatch(removeShowedLayer(layerToHide))
        }
    }
}

export default hideLayer