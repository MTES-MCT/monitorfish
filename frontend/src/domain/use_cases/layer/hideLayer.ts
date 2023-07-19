import { getLayerNameNormalized } from '../../entities/layers'
import layer from '../../shared_slices/Layer'

import type { MainAppThunk } from '../../../store'

/**
 * hide a Regulatory or Administrative layer
 * @param layerToHide {AdministrativeOrRegulatoryLayer} - The layer to hide
 */
export const hideLayer =
  (layerToHide: {
    namespace: 'backoffice' | 'homepage'
    topic?: string
    type: string
    zone?: string | null
  }): MainAppThunk<void> =>
  (dispatch, getState) => {
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

      if (layersToRemove && removeLayerToFeatures && removeShowedLayer) {
        dispatch(removeShowedLayer(layerToHide))
        layersToRemove.forEach(layerToRemove => {
          dispatch(removeLayerToFeatures(getLayerNameNormalized(layerToRemove)))
        })
      }
    }
  }
