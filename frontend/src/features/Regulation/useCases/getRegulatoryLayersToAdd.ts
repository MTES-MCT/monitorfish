import { LayerProperties } from '@features/Map/constants'
import { getLayerNameNormalized } from '@features/Map/utils'
import { isNotNullish } from '@utils/isNotNullish'

import { getVectorOLLayer } from './getVectorOLLayer'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type BaseLayer from 'ol/layer/Base'
import type VectorImageLayer from 'ol/layer/VectorImage'

export const getRegulatoryLayersToAdd =
  <T extends HybridAppDispatch>(
    olLayers: BaseLayer[],
    showedLayers: MonitorFishMap.ShowedLayer[]
  ): HybridAppThunk<T, Array<VectorImageLayer<Feature<Geometry>>>> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
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
        .map(layerToInsert => dispatch(getVectorOLLayer<T>(layerToInsert)))
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
