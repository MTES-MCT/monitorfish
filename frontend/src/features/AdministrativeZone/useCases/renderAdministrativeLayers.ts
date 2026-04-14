import { monitorfishMap } from '@features/Map/monitorfishMap'
import {
  administrativeLayers,
  layerOfTypeAdministrativeLayer,
  layerOfTypeAdministrativeLayerInCurrentMap,
  layersNotInCurrentOLMap,
  layersNotInShowedLayers
} from '@features/Map/utils'

import { getVectorOLLayer } from '../layers/utils'

import type { MainAppThunk } from '@store'

export const renderAdministrativeLayers = (): MainAppThunk => (_, getState) => {
  const { showedLayers } = getState().layer
  const olLayers = monitorfishMap.getLayers()

  const layersToInsert = showedLayers
    .filter(layer => layerOfTypeAdministrativeLayer(administrativeLayers, layer))
    .filter(layer => layersNotInCurrentOLMap(olLayers, layer))

  layersToInsert.forEach(layerToInsert => {
    if (!layerToInsert?.type) {
      return
    }

    olLayers.push(getVectorOLLayer(layerToInsert.type, layerToInsert.zone))
  })

  olLayers
    .getArray()
    .filter(olLayer => layerOfTypeAdministrativeLayerInCurrentMap(administrativeLayers, olLayer))
    .filter(olLayer => layersNotInShowedLayers(showedLayers, olLayer))
    .forEach(layerToRemove => olLayers.remove(layerToRemove))
}
