import { LayerProperties } from '@features/Map/constants'
import VectorImageLayer from 'ol/layer/VectorImage'

import { getRegulatoryVectorSource } from './getRegulatoryVectorSource'
import { getRegulatoryLayerStyle } from '../layers/styles/regulatoryLayer.style'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppThunk } from '@store/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export const getVectorOLLayer =
  (nextVisibleLayer: MonitorFishMap.ShowedLayer): HybridAppThunk<VectorImageLayer<Feature<Geometry>>> =>
  dispatch => {
    const name = `${LayerProperties.REGULATORY.code}:${nextVisibleLayer.topic}:${nextVisibleLayer.zone}`
    const source = dispatch(getRegulatoryVectorSource(nextVisibleLayer))

    const newLayer = new VectorImageLayer({
      className: 'regulatory',
      source,
      style: feature => [getRegulatoryLayerStyle(feature, nextVisibleLayer)]
    })
    // TODO Fix generic `Feature<Geometry>` typings with custom ones.
    ;(newLayer as any).name = name

    return newLayer
  }
