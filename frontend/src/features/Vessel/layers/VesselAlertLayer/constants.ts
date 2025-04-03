import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getVesselAlertStyle } from '@features/Vessel/layers/style'
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
  }) as MonitorFishMap.VectorLayerWithName

  layer.name = LayerProperties.VESSEL_ALERT.code

  return layer
})()
