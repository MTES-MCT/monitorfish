import { AIS_VESSELS_VECTOR_LAYER, AIS_VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/AISVesselsLayer/constants'
import { buildAISVesselFeature } from '@features/Vessel/utils'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { showAISVesselTrack } from '../showAISVesselTrack'

import type { AISVessel } from '@features/Vessel/AISVessel.types'
import type { MainAppThunk } from '@store'

export const renderAISVesselFeatures =
  (vessels: AISVessel.AISVessel[]): MainAppThunk =>
  async (dispatch, getState) => {
    const { selectedAISVessels } = getState().vessel

    const features = vessels
      .map(vessel => buildAISVesselFeature(vessel))
      .filter((feature): feature is NonNullable<typeof feature> => feature !== undefined)

    AIS_VESSELS_VECTOR_SOURCE.clear(true)
    AIS_VESSELS_VECTOR_SOURCE.addFeatures(features)

    const isOpacityReducedEpochMilli = customDayjs().subtract(3, 'hour').valueOf()
    AIS_VESSELS_VECTOR_LAYER.updateStyleVariables({
      isOpacityReducedEpochMilli
    })

    Object.values(selectedAISVessels).forEach(vessel => {
      dispatch(showAISVesselTrack(vessel, false))
    })
  }
