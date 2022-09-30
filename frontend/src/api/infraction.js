import { OK } from './api'

export const INFRACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les NATINFs"

/**
 * Get fishing infractions
 * @memberOf API
 * @returns {Promise<Infraction[]>} The infractions
 * @throws {Error}
 */
function getFishingInfractionsFromAPI() {
  return fetch('/bff/v1/infractions')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(INFRACTIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(INFRACTIONS_ERROR_MESSAGE)
    })
}

export { getFishingInfractionsFromAPI }
