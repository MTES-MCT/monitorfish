import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { filterAdded } from '@features/VesselFilter/slice'

import type { VesselFilter } from '@features/VesselFilter/types'
import type { MainAppThunk } from '@store'

export const addVesselFilter =
  (filter: VesselFilter): MainAppThunk =>
  async dispatch => {
    await dispatch(filterAdded(filter))

    await dispatch(applyFilterToVessels())

    dispatch(renderVesselFeatures())
  }
