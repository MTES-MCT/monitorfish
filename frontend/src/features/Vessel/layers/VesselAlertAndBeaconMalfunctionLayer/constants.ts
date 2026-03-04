import { LayerProperties } from '@features/Map/constants'
import { getVesselAlertAndBeaconMalfunctionStyle } from '@features/Vessel/layers/VesselAlertAndBeaconMalfunctionLayer/style'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE = new VectorSource()

export const VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER = (function () {
  const layer = new Vector({
    source: VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE,
    style: (_, resolution) => getVesselAlertAndBeaconMalfunctionStyle(resolution),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    zIndex: LayerProperties.VESSEL_ALERT_AND_BEACON_MALFUNCTION.zIndex
  })

  layer.setProperties({ code: LayerProperties.VESSEL_ALERT_AND_BEACON_MALFUNCTION.code })

  return layer
})()
