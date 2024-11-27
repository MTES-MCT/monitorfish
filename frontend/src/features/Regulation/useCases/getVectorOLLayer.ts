import { LayerProperties } from '@features/MainMap/constants'
import VectorImageLayer from 'ol/layer/VectorImage'

import { getRegulatoryVectorSource } from './getRegulatoryVectorSource'
import { getRegulatoryLayerStyle } from '../layers/styles/regulatoryLayer.style'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export const getVectorOLLayer =
  <T extends HybridAppDispatch>(
    nextVisibleLayer: MainMap.ShowedLayer
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
