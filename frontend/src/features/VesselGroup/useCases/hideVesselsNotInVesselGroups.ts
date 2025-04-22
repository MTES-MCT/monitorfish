import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { renderVesselFeatures } from '@features/Vessel/useCases/rendering/renderVesselFeatures'
import { vesselGroupActions } from '@features/VesselGroup/slice'

import { booleanToInt } from '../../../utils'

import type { MainAppThunk } from '@store'

export const hideVesselsNotInVesselGroups =
  (areHidden: boolean): MainAppThunk =>
  async dispatch => {
    await dispatch(vesselGroupActions.setAreVesselsNotInVesselGroupsHidden(areHidden))

    VESSELS_VECTOR_LAYER.updateStyleVariables({
      areVesselsNotInVesselGroupsHidden: booleanToInt(areHidden)
    })

    dispatch(renderVesselFeatures())
  }
