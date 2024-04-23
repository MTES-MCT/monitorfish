import { getAllSpeciesFromAPI } from '../../../api/species'
import { setError } from '../../../features/MainWindow/slice'
import { setSpeciesAndSpeciesGroups } from '../../shared_slices/Species'

const getAllSpecies = () => async (dispatch, getState) => {
  if (getState().species.speciesByCode?.length || getState().species.speciesGroups?.length) {
    return
  }

  return getAllSpeciesFromAPI()
    .then(speciesAndSpeciesGroups => {
      const {
        /** @type {Species[]} * */
        groups,
        /** @type {SpeciesGroup[]} * */
        species
      } = speciesAndSpeciesGroups

      const speciesByCode = species.reduce((map, _species) => {
        map[_species.code] = _species

        return map
      }, {})

      return dispatch(
        setSpeciesAndSpeciesGroups({
          groups,
          species,
          speciesByCode
        })
      )
    })
    .catch(error => {
      dispatch(setError(error))
    })
}

export default getAllSpecies
