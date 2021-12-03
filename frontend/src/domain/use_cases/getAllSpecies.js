import { getAllSpeciesFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setSpeciesAndSpeciesGroups } from '../shared_slices/Species'

const getAllSpecies = () => (dispatch, getState) => {
  if (!getState().species.species?.length || !getState().species.speciesGroups?.length) {
    getAllSpeciesFromAPI().then(speciesAndSpeciesGroups => {
      dispatch(setSpeciesAndSpeciesGroups(speciesAndSpeciesGroups))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
  }
}

export default getAllSpecies
