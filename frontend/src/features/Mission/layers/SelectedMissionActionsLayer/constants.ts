import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

import { selectedMissionActionsStyles } from './styles'

export const SELECTED_MISSION_ACTIONS_VECTOR_SOURCE = new VectorSource()

export const SELECTED_MISSION_ACTIONS_VECTOR_LAYER = new VectorLayerWithCode({
  className: MonitorFishMap.MonitorFishLayer.MISSION_ACTION_SELECTED,
  code: MonitorFishMap.MonitorFishLayer.MISSION_ACTION_SELECTED,
  isClickable: true,
  isHoverable: true,
  source: SELECTED_MISSION_ACTIONS_VECTOR_SOURCE,
  style: selectedMissionActionsStyles,
  updateWhileAnimating: true,
  updateWhileInteracting: true,
  zIndex: LayerProperties.MISSION_ACTION_SELECTED.zIndex
})
