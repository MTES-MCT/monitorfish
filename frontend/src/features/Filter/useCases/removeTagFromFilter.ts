import { filterTagRemoved } from '@features/Filter/slice'
import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVessels } from '@features/Vessel/useCases/renderVessels'

import type { FilterTag } from '@features/Filter/types'
import type { MainAppThunk } from '@store'

export const removeTagFromFilter =
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

    dispatch(renderVessels())
  }
