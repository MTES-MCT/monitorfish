import { getVesselsLastPositionsFromAPI } from '../../../api/vessel'
import { resetIsUpdatingVessels, setError } from '../../shared_slices/Global'
import { setVesselsSpeciesAndDistricts } from '../../shared_slices/Vessel'
import getUniqueSpeciesAndDistricts from '../species/getUniqueSpeciesAndDistricts'
import { loadVesselsFromAPIAndApplyFilter } from './applyFilterAndSetVessels'

export const showVesselsLastPosition = () => (dispatch, getState) => {
  if (getState().global.blockVesselsUpdate) {
    dispatch(resetIsUpdatingVessels())

    return
  }

  getVesselsLastPositionsFromAPI()
    .then(vessels => {
      dispatch(loadVesselsFromAPIAndApplyFilter(vessels))
      dispatch(getUniqueSpeciesAndDistricts(vessels)).then(speciesAndDistricts => {
        dispatch(
          setVesselsSpeciesAndDistricts({
            districts: speciesAndDistricts.districts,
            species: speciesAndDistricts.species
          })
        )
      })
    })
    .catch(error => {
      dispatch(setError(error))
    })
    .then(() => {
      dispatch(resetIsUpdatingVessels())
    })
}
