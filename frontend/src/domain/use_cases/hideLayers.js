import layer from '../reducers/Layer'

const hideLayers = layerToHide => (dispatch, getState) => {
  const {
    type,
    zone,
    namespace
  } = layerToHide

  const {
    removeLayer, removeLayerAndArea, removeLayers, removeShowedLayer
  } = layer[namespace].actions

  if (layerToHide && layerToHide.type) {
    let layerToRemove, layersToRemove

    switch (layerToHide.zone) {
      case undefined:
        layerToRemove = getState().layer.layers.find(layer => layer.className_ === layerToHide.type)
        break
      default: {
        dispatch(removeLayerAndArea(`${type}:${zone.layerName}:${zone.zone}`))

        if (layerToHide.zone.zone) {
          layerToRemove = getState().layer.layers.find(layer => {
            return layer.className_ === `${type}:${zone.layerName}:${zone.zone}`
          })
        } else if (zone.layerName) {
          layersToRemove = getState().layer.layers.filter(layer => {
            return layer.className_.includes(`${type}:${zone.layerName}`)
          })
        } else {
          layersToRemove = getState().layer.layers.filter(layer => {
            return layer.className_.includes(`${type}:${zone}`)
          })
        }
        break
      }
    }

    if (layerToRemove) {
      dispatch(removeLayer(layerToRemove))
      dispatch(removeShowedLayer(layerToHide))
    } else if (layersToRemove) {
      dispatch(removeLayers(layersToRemove))
      dispatch(removeShowedLayer(layerToHide))
    }
  }
}

export default hideLayers
