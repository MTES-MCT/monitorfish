import { batch } from 'react-redux'

import { getLayerNameNormalized } from '../../entities/layers'
import layer from '../../shared_slices/Layer'

/**
 * hide a Regulatory or Administrative layer
 * @param layerToHide {AdministrativeOrRegulatoryLayer} - The layer to hide
 */
const hideLayer = layerToHide => (dispatch, getState) => {
  const { namespace, topic, type, zone } = layerToHide

  const { removeLayerToFeatures, removeShowedLayer } = layer[namespace].actions

  const { showedLayers } = getState().layer
  if (type && showedLayers) {
    const layerName = getLayerNameNormalized({ topic, type, zone })

    const layersToRemove = showedLayers.filter(layer_ => {
      if (zone) {
        return getLayerNameNormalized(layer_) === layerName
      }

      return getLayerNameNormalized(layer_).includes(layerName)
    })

    if (layersToRemove) {
      batch(() => {
        dispatch(removeShowedLayer(layerToHide))
        layersToRemove.forEach(layer => {
          dispatch(removeLayerToFeatures(getLayerNameNormalized(layer)))
        })
      })
    }
  }
}

export default hideLayer
