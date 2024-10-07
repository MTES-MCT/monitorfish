import { filterShowed } from '@features/Filter/slice'
import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVessels } from '@features/Vessel/useCases/renderVessels'

import { customHexToRGB } from '../../../utils'

import type { MainAppThunk } from '@store'

export const showFilter =
  (filterUUID: string): MainAppThunk =>
  async (dispatch, getState) => {
    await dispatch(filterShowed(filterUUID))
    const showedFilter = getState().filter?.filters?.find(filter => filter.showed)

    await dispatch(applyFilterToVessels())

    if (showedFilter?.color) {
      const [red, green, blue] = customHexToRGB(showedFilter?.color)
      VESSELS_VECTOR_LAYER.updateStyleVariables({
        filterColorBlue: blue,
        filterColorGreen: green,
        filterColorRed: red
      })
    }

    dispatch(renderVessels())
  }
