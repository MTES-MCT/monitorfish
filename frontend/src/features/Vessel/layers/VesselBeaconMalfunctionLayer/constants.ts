import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getVesselBeaconMalfunctionStyle } from '@features/Vessel/layers/VesselBeaconMalfunctionLayer/style'
import { VectorLayerWithCode } from '@libs/VectorLayerWithCode'
import VectorSource from 'ol/source/Vector'

export const VESSEL_BEACON_MALFUNCTION_VECTOR_SOURCE = new VectorSource()

export const VESSEL_BEACON_MALFUNCTION_LAYER = new VectorLayerWithCode({
  code: MonitorFishMap.MonitorFishLayer.VESSEL_BEACON_MALFUNCTION,
  source: VESSEL_BEACON_MALFUNCTION_VECTOR_SOURCE,
  style: (_, resolution) => getVesselBeaconMalfunctionStyle(resolution),
  updateWhileAnimating: true,
  updateWhileInteracting: true,
  zIndex: LayerProperties.VESSEL_BEACON_MALFUNCTION.zIndex
})
