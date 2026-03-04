import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getVesselAlertStyle } from '@features/Vessel/layers/VesselAlertLayer/style'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

export const VESSEL_ALERT_VECTOR_SOURCE = new VectorSource()

export const VESSEL_ALERT_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.VESSEL_ALERT,
  source: VESSEL_ALERT_VECTOR_SOURCE,
  style: (_, resolution) => getVesselAlertStyle(resolution),
  updateWhileAnimating: true,
  updateWhileInteracting: true,
  zIndex: LayerProperties.VESSEL_ALERT.zIndex
})
