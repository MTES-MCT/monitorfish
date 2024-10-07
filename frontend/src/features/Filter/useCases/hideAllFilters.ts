import { filtersHidden } from '@features/Filter/slice'
import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVessels } from '@features/Vessel/useCases/renderVessels'

import { booleanToInt } from '../../../utils'

import type { MainAppThunk } from '@store'

export const hideAllFilters = (): MainAppThunk => async dispatch => {
  await dispatch(filtersHidden())
  await dispatch(applyFilterToVessels())

  VESSELS_VECTOR_LAYER.updateStyleVariables({
    nonFilteredVesselsAreHidden: booleanToInt(false)
  })

  dispatch(renderVessels())
}
