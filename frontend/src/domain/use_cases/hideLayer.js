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
    removeLayerAndArea,
    removeShowedLayer,
    removeLayerToFeatures
  } = layer[namespace].actions

  const { showedLayers } = getState().layer
  if (type && showedLayers) {
    const layername = [type, topic, zone].filter(Boolean).join(':')
    const layersToRemove = showedLayers.filter(layer_ => {
      return [layer_.type, layer_.topic, layer_.zone].filter(Boolean).join(':') === layername
    })

    if (layersToRemove) {
      batch(() => {
        dispatch(removeShowedLayer(layerToHide))
        layersToRemove.forEach(layer => {
          dispatch(removeLayerAndArea(layer.type))
          dispatch(removeLayerToFeatures(layer.type))
        })
      })
    }
  }
}

export default hideLayer
