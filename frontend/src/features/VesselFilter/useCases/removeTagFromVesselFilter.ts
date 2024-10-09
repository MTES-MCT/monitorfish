import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { filterTagRemoved } from '@features/VesselFilter/slice'

import type { FilterTag } from '@features/VesselFilter/types'
import type { MainAppThunk } from '@store'

export const removeTagFromVesselFilter =
  (tag: FilterTag): MainAppThunk =>
  async dispatch => {
    if (!tag.uuid) {
      return
    }

    await dispatch(
      filterTagRemoved({
        type: tag.type,
        uuid: tag.uuid,
        value: tag.value
      })
    )

    await dispatch(applyFilterToVessels())

    dispatch(renderVesselFeatures())
  }
