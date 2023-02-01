import { HttpStatusCode } from './constants'

export const FAO_AREAS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les zones FAO'

/**
 * Get FAO areas
 * @memberOf API
 * @returns {Promise<string[]>} The FAO areas codes
 * @throws {Error}
 */
function getFAOAreasFromAPI () {
  return fetch('/bff/v1/fao_areas')
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(FAO_AREAS_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(FAO_AREAS_ERROR_MESSAGE)
    })
}

export {
  getFAOAreasFromAPI
}
