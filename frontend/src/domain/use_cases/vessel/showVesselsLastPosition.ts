import { loadVesselsFromAPIAndApplyFilter } from './applyFilterAndSetVessels'
import { getVesselsLastPositionsFromAPI } from '../../../api/vessel'
import { resetIsUpdatingVessels, setError } from '../../shared_slices/Global'
import { setVesselsSpeciesAndDistricts } from '../../shared_slices/Vessel'
import getUniqueSpeciesAndDistricts from '../species/getUniqueSpeciesAndDistricts'

export const showVesselsLastPosition = () => async (dispatch, getState) => {
  if (getState().global.blockVesselsUpdate) {
    dispatch(resetIsUpdatingVessels())

    return
  }

  try {
    const vessels = await getVesselsLastPositionsFromAPI()
    dispatch(loadVesselsFromAPIAndApplyFilter(vessels))
    const speciesAndDistricts = await dispatch(getUniqueSpeciesAndDistricts(vessels))
    dispatch(
      setVesselsSpeciesAndDistricts({
        districts: speciesAndDistricts.districts,
        species: speciesAndDistricts.species
      })
    )
    dispatch(resetIsUpdatingVessels())
  } catch (error) {
    dispatch(setError(error))
  }
}
