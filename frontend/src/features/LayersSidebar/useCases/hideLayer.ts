import { layerActions } from '@features/BaseMap/slice'

import { getLayerNameNormalized } from '../../../domain/entities/layers'

import type { ShowedLayer } from '../../../domain/entities/layers/types'
import type { MainAppThunk } from '../../../store'

/**
 * hide a Regulatory or Administrative layer
 * @param layerToHide {AdministrativeOrRegulatoryLayer} - The layer to hide
 */
export const hideLayer =
  (layerToHide: ShowedLayer): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { topic, type, zone } = layerToHide

    const { showedLayers } = getState().layer
    const layerName = getLayerNameNormalized({ topic, type, zone })

    const layersToRemove = showedLayers.filter(layerToRemove => {
      if (zone) {
        return getLayerNameNormalized(layerToRemove) === layerName
      }

      return getLayerNameNormalized(layerToRemove).includes(layerName)
    })

    dispatch(layerActions.removeShowedLayer(layerToHide))
    layersToRemove.forEach(layerToRemove => {
      dispatch(layerActions.removeLayerToFeatures(getLayerNameNormalized(layerToRemove)))
    })
  }
