import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { reportingLineStyle, reportingWebGLStyle } from '@features/Reporting/layers/style'
import { Vector } from 'ol/layer'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'

export const REPORTINGS_VECTOR_SOURCE = new VectorSource()

export const REPORTINGS_VECTOR_LAYER = new WebGLPointsLayer({
  className: LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].code,
  source: REPORTINGS_VECTOR_SOURCE as any,
  style: reportingWebGLStyle,
  zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].zIndex
})
REPORTINGS_VECTOR_LAYER.setProperties({
  code: MonitorFishMap.MonitorFishLayer.REPORTING,
  isClickable: true,
  isHoverable: true
})

export const REPORTINGS_LINE_VECTOR_SOURCE = new VectorSource()

export const REPORTINGS_LINE_VECTOR_LAYER = new Vector({
  source: REPORTINGS_LINE_VECTOR_SOURCE,
  style: reportingLineStyle,
  zIndex: (LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].zIndex ?? 500) - 1
})
