import { OK } from './api'

export const ALERTS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les alertes opérationelles'

/**
 * Get operational alerts
 * @memberOf API
 * @returns {Promise<Alert[]>} The alerts
 * @throws {Error}
 */
function getOperationalAlertsFromAPI () {
  return fetch('/bff/v1/operational_alerts')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(ALERTS_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(ALERTS_ERROR_MESSAGE)
    })
}

export {
  getOperationalAlertsFromAPI
}
