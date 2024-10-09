import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { filtersHidden } from '@features/VesselFilter/slice'

import { booleanToInt } from '../../../utils'

import type { MainAppThunk } from '@store'

export const hideAllVesselFilters = (): MainAppThunk => async dispatch => {
  await dispatch(filtersHidden())
  await dispatch(applyFilterToVessels())

  VESSELS_VECTOR_LAYER.updateStyleVariables({
    nonFilteredVesselsAreHidden: booleanToInt(false)
  })

  dispatch(renderVesselFeatures())
}
