import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getVesselAlertAndBeaconMalfunctionStyle } from '@features/Vessel/layers/VesselAlertAndBeaconMalfunctionLayer/style'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

export const VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE = new VectorSource()

export const VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.VESSEL_ALERT_AND_BEACON_MALFUNCTION,
  source: VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE,
  style: (_, resolution) => getVesselAlertAndBeaconMalfunctionStyle(resolution),
  updateWhileAnimating: true,
  updateWhileInteracting: true,
  zIndex: LayerProperties.VESSEL_ALERT_AND_BEACON_MALFUNCTION.zIndex
})
