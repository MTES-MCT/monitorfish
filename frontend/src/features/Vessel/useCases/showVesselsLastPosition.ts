import { applyFilterToVessels } from './applyFilterToVessels'
import { resetIsUpdatingVessels } from '../../../domain/shared_slices/Global'
import { setVesselsFromAPI, setVesselsSpeciesAndDistricts } from '../../../domain/shared_slices/Vessel'
import getUniqueSpeciesAndDistricts from '../../../domain/use_cases/species/getUniqueSpeciesAndDistricts'

import type { VesselLastPosition } from '../../../domain/entities/vessel/types'
import type { MainAppThunk } from '@store'

export const showVesselsLastPosition =
  (vessels: VesselLastPosition[]): MainAppThunk =>
  async dispatch => {
    dispatch(setVesselsFromAPI(vessels))
    dispatch(applyFilterToVessels())

    const speciesAndDistricts = await dispatch(getUniqueSpeciesAndDistricts(vessels))
    dispatch(
      setVesselsSpeciesAndDistricts({
        districts: speciesAndDistricts.districts,
        species: speciesAndDistricts.species
      })
    )
    dispatch(resetIsUpdatingVessels())
  }
