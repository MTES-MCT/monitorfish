import { mainMapActions } from '@features/MainMap/slice'

import { getLayerNameNormalized } from '../../MainMap/utils'

import type { MainAppThunk } from '../../../store'
import type { MainMap } from '@features/MainMap/MainMap.types'

/**
 * hide a Regulatory or Administrative layer
 * @param layerToHide {AdministrativeOrRegulatoryLayer} - The layer to hide
 */
export const hideLayer =
  (layerToHide: MainMap.ShowedLayer): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { topic, type, zone } = layerToHide

    const { showedLayers } = getState().mainMap
    const layerName = getLayerNameNormalized({ topic, type, zone })

    const layersToRemove = showedLayers.filter(layerToRemove => {
      if (zone) {
        return getLayerNameNormalized(layerToRemove) === layerName
      }

      return getLayerNameNormalized(layerToRemove).includes(layerName)
    })

    dispatch(mainMapActions.removeShowedLayer(layerToHide))
    layersToRemove.forEach(layerToRemove => {
      dispatch(mainMapActions.removeLayerToFeatures(getLayerNameNormalized(layerToRemove)))
    })
  }
