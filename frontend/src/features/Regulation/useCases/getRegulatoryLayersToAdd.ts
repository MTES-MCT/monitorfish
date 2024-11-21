import { isNotNullish } from '@utils/isNotNullish'

import { getVectorOLLayer } from './getVectorOLLayer'
import { getLayerNameNormalized } from '../../../domain/entities/layers'
import { LayerProperties } from '../../../domain/entities/layers/constants'

import type { MainAppThunk } from '@store'
import type { ShowedLayer } from 'domain/entities/layers/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'
import type BaseLayer from 'ol/layer/Base'
import type VectorImageLayer from 'ol/layer/VectorImage'

export const getRegulatoryLayersToAdd =
  (olLayers: BaseLayer[], showedLayers: ShowedLayer[]): MainAppThunk<Array<VectorImageLayer<Feature<Geometry>>>> =>
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

function layersNotInCurrentOLMap(olLayers, layer) {
  return !olLayers.some(
    olLayer => olLayer.name === getLayerNameNormalized({ type: LayerProperties.REGULATORY.code, ...layer })
  )
}

function layersOfTypeRegulatoryLayer(layer) {
  return layer.type === LayerProperties.REGULATORY.code
}
