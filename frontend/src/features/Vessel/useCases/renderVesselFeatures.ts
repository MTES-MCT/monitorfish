import { VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { buildFeature } from '@features/Vessel/utils'

import type { MainAppThunk } from '@store'

export const renderVesselFeatures = (): MainAppThunk => (_, getState) => {
  const vessels = vesselSelectors.selectAll(getState().vessel.vessels)
  const features = vessels.map(vessel => buildFeature(vessel))

  VESSELS_VECTOR_SOURCE.clear(true)
  VESSELS_VECTOR_SOURCE.addFeatures(features)
}
