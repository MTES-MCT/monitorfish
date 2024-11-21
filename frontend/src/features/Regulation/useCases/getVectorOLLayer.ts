import VectorImageLayer from 'ol/layer/VectorImage'

import { getRegulatoryVectorSource } from './getRegulatoryVectorSource'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { getRegulatoryLayerStyle } from '../layers/styles/regulatoryLayer.style'

import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { ShowedLayer } from 'domain/entities/layers/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export const getVectorOLLayer =
  <T extends HybridAppDispatch>(
    nextVisibleLayer: ShowedLayer
  ): HybridAppThunk<T, Array<VectorImageLayer<Feature<Geometry>>>> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
  dispatch => {
    const name = `${LayerProperties.REGULATORY.code}:${nextVisibleLayer.topic}:${nextVisibleLayer.zone}`
    const source = dispatch(getRegulatoryVectorSource<T>(nextVisibleLayer))

    const newLayer = new VectorImageLayer({
      className: 'regulatory',
      source,
      style: feature => [getRegulatoryLayerStyle(feature, nextVisibleLayer)]
    })
    // TODO Fix generic `Feature<Geometry>` typings with custom ones.
    ;(newLayer as any).name = name

    return newLayer
  }
