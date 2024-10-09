import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { setNonFilteredVesselsAreHidden } from '@features/VesselFilter/slice'

import { booleanToInt } from '../../../utils'

import type { MainAppThunk } from '@store'

export const hideOrShowNonFilteredVessels =
  (areHidden: boolean): MainAppThunk =>
  async dispatch => {
    await dispatch(setNonFilteredVesselsAreHidden(areHidden))

    VESSELS_VECTOR_LAYER.updateStyleVariables({
      nonFilteredVesselsAreHidden: booleanToInt(areHidden)
    })

    dispatch(renderVesselFeatures())
  }
