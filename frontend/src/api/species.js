import { HttpStatusCode } from './constants'

export const SPECIES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les espèces'

/**
 * Get species
 * @memberOf API
 * @returns {Promise<SpeciesAndSpeciesGroupsAPIData>}
 * @throws {Error}
 */
function getAllSpeciesFromAPI () {
  return fetch('/bff/v1/species')
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(SPECIES_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(SPECIES_ERROR_MESSAGE)
    })
}

export {
  getAllSpeciesFromAPI
}
