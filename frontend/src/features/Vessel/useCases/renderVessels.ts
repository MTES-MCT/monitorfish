import { VESSELS_VECTOR_SOURCE } from '@features/Vessel/layers/VesselsLayer/constants'
import { vesselSelectors } from '@features/Vessel/slice'
import { buildFeature } from '@features/Vessel/utils'

import type { MainAppThunk } from '@store'

export const renderVessels = (): MainAppThunk => async (_, getState) => {
  const vessels = vesselSelectors.selectAll(getState())
  const features = vessels.map(vessel => buildFeature(vessel))

  VESSELS_VECTOR_SOURCE.clear(true)
  VESSELS_VECTOR_SOURCE.addFeatures(features)
}
