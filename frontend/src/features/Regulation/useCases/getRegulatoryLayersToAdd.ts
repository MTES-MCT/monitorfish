import { LayerProperties } from '@features/Map/constants'
import { getLayerNameNormalized } from '@features/Map/utils'
import { isNotNullish } from '@utils/isNotNullish'

import { getVectorOLLayer } from './getVectorOLLayer'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppThunk } from '@store/types'
import type BaseLayer from 'ol/layer/Base'

export const getRegulatoryLayersToAdd =
  (olLayers: BaseLayer[], showedLayers: MonitorFishMap.ShowedLayer[]): HybridAppThunk =>
  dispatch => {
    if (!showedLayers.length) {
      return []
    }

    const layersToInsert = showedLayers
      .filter(layer => layersNotInCurrentOLMap(olLayers, layer))
      .filter(layer => layersOfTypeRegulatoryLayer(layer))

    return (
      layersToInsert
        // TODO Is it really necessary?
        .filter(isNotNullish)
        .map(layerToInsert => dispatch(getVectorOLLayer(layerToInsert)))
        // TODO Is it really necessary?
        .filter(isNotNullish)
    )
  }

function layersNotInCurrentOLMap(olLayers: BaseLayer[], layer: MonitorFishMap.ShowedLayer) {
  return !olLayers.some(
    // TODO Create a custom `BaseLayer`.
    olLayer => (olLayer as any).name === getLayerNameNormalized({ type: LayerProperties.REGULATORY.code, ...layer })
  )
}

function layersOfTypeRegulatoryLayer(layer: MonitorFishMap.ShowedLayer) {
  return layer.type === LayerProperties.REGULATORY.code
}
