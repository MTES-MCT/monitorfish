import layer from '../../shared_slices/Layer'
import { batch } from 'react-redux'
import { getLayerNameNormalized } from '../../entities/layers'

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
    removeShowedLayer,
    removeLayerToFeatures
  } = layer[namespace].actions

  const { showedLayers } = getState().layer
  if (type && showedLayers) {
    const layerName = getLayerNameNormalized({ type, topic, zone })

    const layersToRemove = showedLayers.filter(layer_ => {
      if (zone) {
        return getLayerNameNormalized(layer_) === layerName
      } else {
        return getLayerNameNormalized(layer_).includes(layerName)
      }
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
