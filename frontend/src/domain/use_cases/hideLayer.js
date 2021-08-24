import layer from '../shared_slices/Layer'
import { batch } from 'react-redux'

/**
 * hide a Regulatory or Administrative layer
 * @param layerToHide {AdministrativeOrRegulatoryLayer} - The layer to hide
 */
const hideLayer = layerToHide => (dispatch, getState) => {
  const {
    type,
    topic,
    zone,
    namespace
  } = layerToHide

  const {
    removeLayer, removeLayerAndArea, removeLayers, removeShowedLayer
  } = layer[namespace].actions

  if (type) {
    let layerToRemove, layersToRemove

    switch (zone) {
      case undefined:
        layerToRemove = getState().layer.layers.find(layer => layer.className_ === type)
        break
      default: {
        dispatch(removeLayerAndArea(`${type}:${topic}:${zone}`))

        if (topic && zone) {
          layerToRemove = getState().layer.layers.find(layer => {
            return layer.className_ === `${type}:${topic}:${zone}`
          })
        } else if (topic) {
          layersToRemove = getState().layer.layers.filter(layer => {
            return layer.className_.includes(`${type}:${topic}`)
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
      batch(() => {
        dispatch(removeLayer(layerToRemove))
        dispatch(removeShowedLayer(layerToHide))
      })
    } else if (layersToRemove) {
      batch(() => {
        dispatch(removeLayers(layersToRemove))
        dispatch(removeShowedLayer(layerToHide))
      })
    }
  }
}

export default hideLayer
