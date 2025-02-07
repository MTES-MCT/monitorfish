import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { renderVesselFeatures } from '@features/Vessel/useCases/renderVesselFeatures'
import { Vessel } from '@features/Vessel/Vessel.types'

import { applyFilterToVessels } from './applyFilterToVessels'
import { resetIsUpdatingVessels } from '../../../domain/shared_slices/Global'
import { getUniqueSpeciesAndDistricts } from '../../../domain/use_cases/species/getUniqueSpeciesAndDistricts'
import { customHexToRGB } from '../../../utils'
import { setVessels, setVesselsSpeciesAndDistricts } from '../slice'

import type { MainAppThunk } from '@store'

export const showVesselsLastPosition =
  (vessels: Vessel.VesselLastPosition[]): MainAppThunk =>
  async (dispatch, getState) => {
    const showedFilter = getState().filter?.filters?.find(filter => filter.showed)

    await dispatch(setVessels(vessels))

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

    const speciesAndDistricts = await dispatch(getUniqueSpeciesAndDistricts(vessels))
    dispatch(
      setVesselsSpeciesAndDistricts({
        districts: speciesAndDistricts.districts,
        species: speciesAndDistricts.species
      })
    )
    dispatch(resetIsUpdatingVessels())
  }
