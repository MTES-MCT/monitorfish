import {removeLayer, removeLayerAndArea, removeLayers, removeShowedLayer} from "../reducers/Layer";

const hideLayers = layerToHide => (dispatch, getState) => {
    if(layerToHide && layerToHide.type) {
        let layerToRemove, layersToRemove

        switch (layerToHide.zone) {
            case undefined: layerToRemove = getState().layer.layers.find(layer => layer.className_ === layerToHide.type); break;
            default: {
                dispatch(removeLayerAndArea(`${layerToHide.type}:${layerToHide.zone.layerName}:${layerToHide.zone.zone}`))

                if(layerToHide.zone.zone) {
                    layerToRemove = getState().layer.layers.find(layer => {
                        return layer.className_ === `${layerToHide.type}:${layerToHide.zone.layerName}:${layerToHide.zone.zone}`
                    })
                } else {
                    layersToRemove = getState().layer.layers.filter(layer => {
                        return layer.className_.includes(`${layerToHide.type}:${layerToHide.zone.layerName}`)
                    })
                }
                break;
            }
        }

        if (layerToRemove) {
            dispatch(removeLayer(layerToRemove));
            dispatch(removeShowedLayer(layerToHide))
        } else if(layersToRemove) {
            dispatch(removeLayers(layersToRemove));
            dispatch(removeShowedLayer(layerToHide))
        }
    }
}

export default hideLayers