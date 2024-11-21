import { layerActions } from '@features/BaseMap/slice'

import type { MainAppThunk } from '../../../store'

export const hideRegulatoryZoneLayerById =
  (id: number | string): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { showedLayers } = getState().layer

    const hiddenLayer = showedLayers.find(showedLayer => showedLayer.id === id)
    if (!hiddenLayer) {
      return
    }

    dispatch(layerActions.removeShowedLayer(hiddenLayer))
  }
