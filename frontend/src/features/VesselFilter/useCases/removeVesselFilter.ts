import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { filterRemoved } from '@features/VesselFilter/slice'

import type { MainAppThunk } from '@store'

export const removeVesselFilter =
  (filterUUID: string): MainAppThunk =>
  async dispatch => {
    await dispatch(filterRemoved(filterUUID))

    await dispatch(applyFilterToVessels())

    dispatch(renderVesselFeatures())
  }
