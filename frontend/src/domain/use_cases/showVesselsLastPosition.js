import { getVesselsLastPositionsFromAPI } from '../../api/fetch'
import { resetIsUpdatingVessels, setError } from '../shared_slices/Global'
import { setVessels, setVesselsSpeciesAndDistricts } from '../shared_slices/Vessel'
import getUniqueSpeciesAndDistricts from './getUniqueSpeciesAndDistricts'

const showVesselsLastPosition = () => (dispatch, getState) => {
  if (getState().global.blockVesselsUpdate) {
    dispatch(resetIsUpdatingVessels())
    return
  }

  getVesselsLastPositionsFromAPI().then(vessels => {
    dispatch(setVessels(vessels))
    dispatch(getUniqueSpeciesAndDistricts(vessels)).then(speciesAndDistricts => {
      dispatch(setVesselsSpeciesAndDistricts({
        species: speciesAndDistricts.species,
        districts: speciesAndDistricts.districts
      }))
    })
  }).catch(error => {
    console.error(error)
    dispatch(setError(error))
  }).then(() => {
    dispatch(resetIsUpdatingVessels())
  })
}

export default showVesselsLastPosition
