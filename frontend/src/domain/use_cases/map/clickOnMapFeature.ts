import { LayerProperties } from '../../entities/layers/constants'
import { showRegulatoryZoneMetadata } from '../layer/regulation/showRegulatoryZoneMetadata'
import { getVesselVoyage } from '../vessel/getVesselVoyage'
import { showVessel } from '../vessel/showVessel'
import { showVesselTrack } from '../vessel/showVesselTrack'

import type { VesselLastPositionFeature } from '../../entities/vessel/types'
import type { MapClickEvent } from '../../types/map'

export const clickOnMapFeature = (clickEvent: MapClickEvent) => (dispatch, getState) => {
  const { previewFilteredVesselsMode } = getState().global
  if (!clickEvent.feature) {
    return
  }

  const clickedFeatureId = clickEvent.feature.getId()?.toString()
  if (!clickedFeatureId) {
    return
  }

  if (clickedFeatureId.includes(LayerProperties.REGULATORY.code)) {
    const zone = {
      topic: clickEvent.feature.getProperties().topic,
      zone: clickEvent.feature.getProperties().zone
    }
    dispatch(showRegulatoryZoneMetadata(zone, false))

    return
  }

  if (previewFilteredVesselsMode) {
    return
  }

  if (clickedFeatureId.includes(LayerProperties.VESSELS.code)) {
    const clickedVessel = (clickEvent.feature as VesselLastPositionFeature).vesselProperties

    if (clickEvent.ctrlKeyPressed) {
      dispatch(showVesselTrack(clickedVessel, false, null))
    } else {
      dispatch(showVessel(clickedVessel, false, false))
      dispatch(getVesselVoyage(clickedVessel, undefined, false))
    }
  }
}
