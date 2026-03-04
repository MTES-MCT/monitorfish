import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

import { missionZoneStyle } from './MissionLayer/styles'

export const HOVERED_MISSION_VECTOR_SOURCE = new VectorSource()

export const HOVERED_MISSION_VECTOR_LAYER = new VectorLayerWithCode({
  className: MonitorFishMap.MonitorFishLayer.MISSION_HOVER,
  code: MonitorFishMap.MonitorFishLayer.MISSION_HOVER,
  renderBuffer: 7,
  source: HOVERED_MISSION_VECTOR_SOURCE,
  style: missionZoneStyle,
  updateWhileAnimating: true,
  updateWhileInteracting: true,
  zIndex: LayerProperties.MISSION_HOVER.zIndex
})
