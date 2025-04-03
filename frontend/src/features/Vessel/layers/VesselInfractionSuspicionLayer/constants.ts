import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { getVesselInfractionSuspicionStyle } from '@features/Vessel/layers/VesselInfractionSuspicionLayer/style'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

export const VESSEL_INFRACTION_SUSPICION_VECTOR_SOURCE = new VectorSource()

export const VESSEL_INFRACTION_SUSPICION_LAYER = (function () {
  const layer = new Vector({
    source: VESSEL_INFRACTION_SUSPICION_VECTOR_SOURCE,
    style: (_, resolution) => getVesselInfractionSuspicionStyle(resolution),
    updateWhileAnimating: true,
    updateWhileInteracting: true,
    zIndex: LayerProperties.VESSEL_INFRACTION_SUSPICION.zIndex
  }) as MonitorFishMap.VectorLayerWithName

  layer.name = LayerProperties.VESSEL_INFRACTION_SUSPICION.code

  return layer
})()
