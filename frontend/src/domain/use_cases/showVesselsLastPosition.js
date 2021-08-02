import { getVesselsLastPositionsFromAPI } from '../../api/fetch'
import { setError } from '../reducers/Global'
import { setVessels, setVesselsSpeciesAndDistricts } from '../reducers/Vessel'
import getUniqueSpeciesAndDistricts from './getUniqueSpeciesAndDistricts'

const showVesselsLastPosition = () => dispatch => {
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
  })
}

export default showVesselsLastPosition
