import { getAllSpeciesFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { batch } from 'react-redux'
import { setSpeciesAndSpeciesGroups } from '../shared_slices/Species'

const getAllSpecies = () => dispatch => {
  getAllSpeciesFromAPI().then(speciesAndSpeciesGroups => {
    batch(() => {
      dispatch(setSpeciesAndSpeciesGroups(speciesAndSpeciesGroups))
    })
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllSpecies
