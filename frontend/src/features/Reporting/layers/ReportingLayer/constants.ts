import { LayerProperties } from '@features/Map/constants'
import { dottedLayerStyle } from '@features/Map/layers/styles/dottedLayer.style'
import { MonitorFishMap } from '@features/Map/Map.types'
import { reportingLineStyle, reportingWebGLStyle } from '@features/Reporting/layers/style'
import { Vector } from 'ol/layer'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import VectorSource from 'ol/source/Vector'

export const REPORTINGS_VECTOR_SOURCE = new VectorSource()

let reportingsVectorLayer: WebGLPointsLayer<any> | undefined

/**
 * Created on first use: creating a WebGL layer downloads the icons sprite of its style,
 * while this layer is only displayed to super-users.
 */
export function getReportingsVectorLayer(): WebGLPointsLayer<any> {
  if (!reportingsVectorLayer) {
    reportingsVectorLayer = new WebGLPointsLayer({
      className: LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].code,
      source: REPORTINGS_VECTOR_SOURCE as any,
      style: reportingWebGLStyle,
      zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].zIndex
    })
    reportingsVectorLayer.setProperties({
      code: MonitorFishMap.MonitorFishLayer.REPORTING,
      isClickable: true,
      isHoverable: true
    })
  }

  return reportingsVectorLayer
}

export const REPORTINGS_LINE_VECTOR_SOURCE = new VectorSource()

export const REPORTINGS_LINE_VECTOR_LAYER = new Vector({
  source: REPORTINGS_LINE_VECTOR_SOURCE,
  style: reportingLineStyle,
  zIndex: (LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].zIndex ?? 500) - 1
})

export const REPORTINGS_ZONE_FILTER_VECTOR_SOURCE = new VectorSource()

export const REPORTINGS_ZONE_FILTER_VECTOR_LAYER = new Vector({
  source: REPORTINGS_ZONE_FILTER_VECTOR_SOURCE,
  style: dottedLayerStyle,
  zIndex: (LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].zIndex ?? 500) - 2
})
