import { isNotNullish } from '@utils/isNotNullish'

import { getVectorOLLayer } from './getVectorOLLayer'
import { getLayerNameNormalized } from '../../../domain/entities/layers'
import { LayerProperties } from '../../../domain/entities/layers/constants'

import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { ShowedLayer } from 'domain/entities/layers/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type BaseLayer from 'ol/layer/Base'
import type VectorImageLayer from 'ol/layer/VectorImage'

export const getRegulatoryLayersToAdd =
  <T extends HybridAppDispatch>(
    olLayers: BaseLayer[],
    showedLayers: ShowedLayer[]
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

function layersNotInCurrentOLMap(olLayers: BaseLayer[], layer: ShowedLayer) {
  return !olLayers.some(
    // TODO Create a custom `BaseLayer`.
    olLayer => (olLayer as any).name === getLayerNameNormalized({ type: LayerProperties.REGULATORY.code, ...layer })
  )
}

function layersOfTypeRegulatoryLayer(layer: ShowedLayer) {
  return layer.type === LayerProperties.REGULATORY.code
}
