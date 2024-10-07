import { filterRemoved } from '@features/Filter/slice'
import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVessels } from '@features/Vessel/useCases/renderVessels'

import type { MainAppThunk } from '@store'

export const removeFilter =
  (filterUUID: string): MainAppThunk =>
  async dispatch => {
    await dispatch(filterRemoved(filterUUID))

    await dispatch(applyFilterToVessels())

    dispatch(renderVessels())
  }
