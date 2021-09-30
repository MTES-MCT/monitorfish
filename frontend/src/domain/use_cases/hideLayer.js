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
    removeLayer,
    removeLayerAndArea,
    removeLayers,
    removeShowedLayer,
    removeLayerToFeatures
  } = layer[namespace].actions

  if (type) {
    let layerToRemove, layersToRemove

    if (topic && zone) {
      layerToRemove = getState().layer.layers.find(layer => {
        return layer.className_ === `${type}:${topic}:${zone}`
      })
    } else if (topic) {
      layersToRemove = getState().layer.layers.filter(layer => {
        return layer.className_.includes(`${type}:${topic}`)
      })
    } else if (zone) {
      layersToRemove = getState().layer.layers.filter(layer => {
        return layer.className_.includes(`${type}:${zone}`)
      })
    } else {
      layerToRemove = getState().layer.layers.find(layer => layer.className_ === type)
    }

    if (layerToRemove) {
      batch(() => {
        dispatch(removeLayer(layerToRemove))
        dispatch(removeShowedLayer(layerToHide))
        dispatch(removeLayerAndArea(layerToRemove.className_))
        dispatch(removeLayerToFeatures(layerToRemove.className_))
      })
    } else if (layersToRemove) {
      batch(() => {
        dispatch(removeLayers(layersToRemove))
        dispatch(removeShowedLayer(layerToHide))
        layersToRemove.forEach(layer => dispatch(removeLayerAndArea(layer.className_)))
        layersToRemove.forEach(layer => dispatch(removeLayerToFeatures(layer.className_)))
      })
    }
  }
}

export default hideLayer
