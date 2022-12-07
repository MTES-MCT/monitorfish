import { setError } from '../../shared_slices/Global'
import { setSpeciesAndSpeciesGroups } from '../../shared_slices/Species'
import { getAllSpeciesFromAPI } from '../../../api/species'

const getAllSpecies = () => async (dispatch, getState) => {
  if (getState().species.speciesByCode?.length || getState().species.speciesGroups?.length) {
    return
  }

  return getAllSpeciesFromAPI().then(speciesAndSpeciesGroups => {
    const {
      /** @type {Species[]} **/
      species,
      /** @type {SpeciesGroup[]} **/
      groups
    } = speciesAndSpeciesGroups

    const speciesByCode = species.reduce((map, _species) => {
      map[_species.code] = _species
      return map
    }, {})

    return dispatch(setSpeciesAndSpeciesGroups({
      species,
      speciesByCode,
      groups
    }))
  }).catch(error => {
    dispatch(setError(error))
  })
}

export default getAllSpecies
