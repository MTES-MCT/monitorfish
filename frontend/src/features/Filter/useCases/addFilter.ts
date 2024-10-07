import { filterAdded } from '@features/Filter/slice'
import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVessels } from '@features/Vessel/useCases/renderVessels'

import type { VesselFilter } from '@features/Filter/types'
import type { MainAppThunk } from '@store'

export const addFilter =
  (filter: VesselFilter): MainAppThunk =>
  async dispatch => {
    await dispatch(filterAdded(filter))

    await dispatch(applyFilterToVessels())

    dispatch(renderVessels())
  }
