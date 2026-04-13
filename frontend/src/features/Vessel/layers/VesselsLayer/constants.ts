import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { webGLVesselRule, getWebGLVesselStyleVariables } from '@features/Vessel/layers/style'
import WebGLVectorLayer from 'ol/layer/WebGLVector'
import VectorSource from 'ol/source/Vector'

export const VESSELS_VECTOR_SOURCE = new VectorSource()

export const VESSELS_VECTOR_LAYER = new WebGLVectorLayer({
  className: MonitorFishMap.MonitorFishLayer.VESSELS,
  source: VESSELS_VECTOR_SOURCE as any,
  style: [webGLVesselRule],
  variables: getWebGLVesselStyleVariables({
    areVesselsNotInVesselGroupsHidden: false,
    hideNonSelectedVessels: false,
    isLight: false,
    previewFilteredVesselsMode: false,
    vesselGroupsIdsDisplayed: []
  }),
  zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.VESSELS].zIndex
})
VESSELS_VECTOR_LAYER.setProperties({
  code: MonitorFishMap.MonitorFishLayer.VESSELS,
  isClickable: true,
  isHoverable: true
})
