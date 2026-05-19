import { AIS_VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/AISVesselsLayer/constants'
import { VESSEL_TRACK_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsTracksLayer/constants'
import { removeSelectedAISVessel } from '@features/Vessel/slice'
import { removeVesselTrackFeatures } from '@features/Vessel/types/track'

import type { AISVessel } from '@features/Vessel/AISVessel.types'

export const hideAISVesselTrack = (aisVessel: AISVessel.AISVessel) => dispatch => {
  const vesselCompositeIdentifier = aisVessel.mmsi.toString(10)
  removeVesselTrackFeatures(
    VESSEL_TRACK_VECTOR_SOURCE.getFeatures(),
    VESSEL_TRACK_VECTOR_SOURCE,
    vesselCompositeIdentifier
  )
  const feature = AIS_VESSELS_VECTOR_SOURCE.getFeatureById(aisVessel.vesselFeatureId)
  feature?.set('isSelected', false)

  dispatch(removeSelectedAISVessel(aisVessel.mmsi))
}
