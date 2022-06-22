import { OK } from './api'

export const CONTROLLERS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les unités'

/**
 * Get all controllers
 * @memberOf API
 * @returns {Promise<Controller[]>} The controllers
 * @throws {Error}
 */
function getControllersFromAPI () {
  return fetch('/bff/v1/controllers')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(CONTROLLERS_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(CONTROLLERS_ERROR_MESSAGE)
    })
}

export {
  getControllersFromAPI
}
