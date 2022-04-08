import { OK } from './api'

export const HEALTH_CHECK_ERROR_MESSAGE = 'Nous n\'avons pas pu vérifier si l\'application est à jour'

/**
 * Get application healthcheck
 * @memberOf API
 * @returns {Promise<Healthcheck>} The healthcheck dates of positions and ers messages
 * @throws {Error}
 */
function getHealthcheckFromAPI () {
  return fetch('/bff/v1/healthcheck')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(HEALTH_CHECK_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(HEALTH_CHECK_ERROR_MESSAGE)
    })
}

export {
  getHealthcheckFromAPI
}
