import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getWebGLAISVesselStyleVariables, webGLAISVesselRule } from '@features/Vessel/layers/AISVesselsLayer/style'
import WebGLVectorLayer from 'ol/layer/WebGLVector'
import VectorSource from 'ol/source/Vector'

export const AIS_VESSELS_VECTOR_SOURCE = new VectorSource()

export const AIS_VESSELS_VECTOR_LAYER = new WebGLVectorLayer({
  className: MonitorFishMap.MonitorFishLayer.AIS_VESSELS,
  source: AIS_VESSELS_VECTOR_SOURCE as any,
  style: [webGLAISVesselRule],
  variables: getWebGLAISVesselStyleVariables({
    areVesselsNotInVesselGroupsHidden: false,
    hideNonSelectedVessels: false,
    isLight: false
  }),
  zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.AIS_VESSELS].zIndex
})
AIS_VESSELS_VECTOR_LAYER.setProperties({
  code: MonitorFishMap.MonitorFishLayer.AIS_VESSELS,
  isClickable: false,
  isHoverable: true
})
