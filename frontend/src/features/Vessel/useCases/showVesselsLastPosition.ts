import { applyFilterToVessels } from './applyFilterToVessels'
import { setVesselsFromAPI, setVesselsSpeciesAndDistricts } from '../../../domain/shared_slices/Vessel'
import getUniqueSpeciesAndDistricts from '../../../domain/use_cases/species/getUniqueSpeciesAndDistricts'
import { resetIsUpdatingVessels } from '../../MainWindow/slice'

import type { VesselLastPosition } from '../../../domain/entities/vessel/types'

export const showVesselsLastPosition = (vessels: VesselLastPosition[]) => async dispatch => {
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
