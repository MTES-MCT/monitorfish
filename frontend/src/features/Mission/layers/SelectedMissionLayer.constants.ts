import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

import { missionZoneStyle } from './MissionLayer/styles'

export const SELECTED_MISSION_VECTOR_SOURCE = new VectorSource()

export const SELECTED_MISSION_VECTOR_LAYER = new VectorLayerWithCode({
  className: MonitorFishMap.MonitorFishLayer.MISSION_SELECTED,
  code: MonitorFishMap.MonitorFishLayer.MISSION_SELECTED,
  renderBuffer: 7,
  source: SELECTED_MISSION_VECTOR_SOURCE,
  style: missionZoneStyle,
  updateWhileAnimating: true,
  updateWhileInteracting: true,
  zIndex: LayerProperties.MISSION_SELECTED.zIndex
})
