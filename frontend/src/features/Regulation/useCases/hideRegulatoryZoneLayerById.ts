import layer from '../../../domain/shared_slices/Layer'
import { FrontendError } from '../../../libs/FrontendError'

import type { LayerSliceNamespace } from '../../../domain/entities/layers/types'
import type { MainAppThunk } from '../../../store'

export const hideRegulatoryZoneLayerById =
  (id: number | string, namespace: LayerSliceNamespace): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { removeLayerToFeatures, removeShowedLayer } = layer[namespace].actions
    if (!removeLayerToFeatures || !removeShowedLayer) {
      throw new FrontendError('`removeLayerToFeatures` or `removeShowedLayer` is undefined.')
    }

    const { showedLayers } = getState().layer

    const hiddenLayer = showedLayers.find(showedLayer => showedLayer.id === id)
    if (!hiddenLayer) {
      return
    }

    dispatch(removeShowedLayer(hiddenLayer))
  }
