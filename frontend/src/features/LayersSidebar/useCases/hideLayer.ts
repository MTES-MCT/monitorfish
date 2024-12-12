import { layerActions } from '@features/Map/layer.slice'
import { backOfficeLayerActions } from '@features/Map/layer.slice.backoffice'
import { getLayerNameNormalized } from '@features/Map/utils'

import type { MainAppThunk } from '../../../store'
import type { MonitorFishMap } from '@features/Map/Map.types'

/**
 * hide a Regulatory or Administrative layer
 * @param layerToHide {AdministrativeOrRegulatoryLayer} - The layer to hide
 */
export const hideLayer =
  (layerToHide: MonitorFishMap.ShowedLayer): MainAppThunk<void> =>
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

    const actions = getState().global.isBackoffice ? backOfficeLayerActions : layerActions

    dispatch(actions.removeShowedLayer(layerToHide))
    layersToRemove.forEach(layerToRemove => {
      dispatch(actions.removeLayerToFeatures(getLayerNameNormalized(layerToRemove)))
    })
  }
