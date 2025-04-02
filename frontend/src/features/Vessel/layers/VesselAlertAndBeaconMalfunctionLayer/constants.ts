import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getVesselAlertAndBeaconMalfunctionStyle } from '@features/Vessel/layers/style'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE = new VectorSource()

export const VESSEL_ALERT_AND_BEACON_MALFUNCTION_LAYER = (function () {
  const layer = new Vector({
    source: VESSEL_ALERT_AND_BEACON_MALFUNCTION_VECTOR_SOURCE,
    style: (_, resolution) => getVesselAlertAndBeaconMalfunctionStyle(resolution),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    zIndex: LayerProperties.VESSEL_BEACON_MALFUNCTION.zIndex
  }) as MonitorFishMap.VectorLayerWithName

  layer.name = LayerProperties.VESSEL_BEACON_MALFUNCTION.code

  return layer
})()
