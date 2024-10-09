import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { applyFilterToVessels } from '@features/Vessel/useCases/applyFilterToVessels'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { filterShowed } from '@features/VesselFilter/slice'

import { customHexToRGB } from '../../../utils'

import type { MainAppThunk } from '@store'

export const showVesselFilter =
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

    dispatch(renderVesselFeatures())
  }
