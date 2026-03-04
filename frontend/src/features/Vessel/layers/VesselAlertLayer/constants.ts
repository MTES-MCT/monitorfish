import { LayerProperties } from '@features/Map/constants'
import { getVesselAlertStyle } from '@features/Vessel/layers/VesselAlertLayer/style'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const VESSEL_ALERT_VECTOR_SOURCE = new VectorSource()

export const VESSEL_ALERT_LAYER = (function () {
  const layer = new Vector({
    source: VESSEL_ALERT_VECTOR_SOURCE,
    style: (_, resolution) => getVesselAlertStyle(resolution),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    zIndex: LayerProperties.VESSEL_ALERT.zIndex
  })

  layer.setProperties({ code: LayerProperties.VESSEL_ALERT.code })

  return layer
})()
