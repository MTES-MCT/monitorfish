import { mainMapActions } from '@features/MainMap/slice'

import type { MainAppThunk } from '../../../store'

export const hideRegulatoryZoneLayerById =
  (id: number | string): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { showedLayers } = getState().mainMap

    const hiddenLayer = showedLayers.find(showedLayer => showedLayer.id === id)
    if (!hiddenLayer) {
      return
    }

    dispatch(mainMapActions.removeShowedLayer(hiddenLayer))
  }
