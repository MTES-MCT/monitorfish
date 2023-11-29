import { getLayerNameNormalized } from '../../../domain/entities/layers'
import layer from '../../../domain/shared_slices/Layer'
import { FrontendError } from '../../../libs/FrontendError'

import type { LayerSliceNamespace } from '../../../domain/entities/layers/types'
import type { MainAppThunk } from '../../../store'

/**
 * hide a Regulatory or Administrative layer
 * @param layerToHide {AdministrativeOrRegulatoryLayer} - The layer to hide
 */
export const hideLayer =
  (layerToHide: {
    namespace: LayerSliceNamespace
    topic?: string
    type: string
    zone?: string | null
  }): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { namespace, topic, type, zone } = layerToHide

    const { removeLayerToFeatures, removeShowedLayer } = layer[namespace].actions
    if (!removeLayerToFeatures || !removeShowedLayer) {
      throw new FrontendError('`removeLayerToFeatures` or `removeShowedLayer` is undefined.')
    }

    const { showedLayers } = getState().layer
    const layerName = getLayerNameNormalized({ topic, type, zone })

    const layersToRemove = showedLayers.filter(layerToRemove => {
      if (zone) {
        return getLayerNameNormalized(layerToRemove) === layerName
      }

      return getLayerNameNormalized(layerToRemove).includes(layerName)
    })

    dispatch(removeShowedLayer(layerToHide))
    layersToRemove.forEach(layerToRemove => {
      dispatch(removeLayerToFeatures(getLayerNameNormalized(layerToRemove)))
    })
  }
