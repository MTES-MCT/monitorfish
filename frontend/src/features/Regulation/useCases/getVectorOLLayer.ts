import { LayerProperties } from '@features/Map/constants'
import VectorImageLayer from 'ol/layer/VectorImage'

import { getRegulatoryVectorSource } from './getRegulatoryVectorSource'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export const getVectorOLLayer =
  <T extends HybridAppDispatch>(
    nextVisibleLayer: MonitorFishMap.ShowedLayer
  ): HybridAppThunk<T, Array<VectorImageLayer<Feature<Geometry>>>> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
  dispatch => {
    const name = `${LayerProperties.REGULATORY.code}:${nextVisibleLayer.topic}:${nextVisibleLayer.zone}`
    const source = dispatch(getRegulatoryVectorSource<T>(nextVisibleLayer))

    const newLayer = new VectorImageLayer({
      className: 'regulatory',
      renderBuffer: 500,
      source
    })
    // TODO Fix generic `Feature<Geometry>` typings with custom ones.
    ;(newLayer as any).name = name

    return newLayer
  }
