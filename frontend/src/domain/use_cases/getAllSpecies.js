import { getAllSpeciesFromAPI } from '../../api/fetch'
import { setError } from '../shared_slices/Global'
import { setSpeciesAndSpeciesGroups } from '../shared_slices/Species'

const getAllSpecies = () => (dispatch, getState) => {
  if (!getState().species.speciesByCode?.length || !getState().species.speciesGroups?.length) {
    getAllSpeciesFromAPI().then(speciesAndSpeciesGroups => {
      const {
        species,
        groups
      } = speciesAndSpeciesGroups
      const speciesByCode = species.reduce((map, _species) => {
        map[_species.code] = _species
        return map
      }, {})
      dispatch(setSpeciesAndSpeciesGroups({ speciesByCode, groups }))
    }).catch(error => {
      console.error(error)
      dispatch(setError(error))
    })
  }
}

export default getAllSpecies
