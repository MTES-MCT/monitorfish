import { CREATED, OK } from './api'

export const ALERTS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les alertes opérationelles'
export const VALIDATE_ALERT_ERROR_MESSAGE = 'Nous n\'avons pas pu valider l\'alerte opérationelle'
export const IGNORE_ALERT_ERROR_MESSAGE = 'Nous n\'avons pas pu ignorer l\'alerte opérationelle'

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

/**
 * Validate an alert
 * @memberOf API
 * @throws {Error}
 */
function validateAlertFromAPI (uuid) {
  return fetch(`/bff/v1/operational_alerts/${uuid}/validate`, {
    method: 'PUT'
  }).then(response => {
    if (response.status !== CREATED) {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(VALIDATE_ALERT_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(VALIDATE_ALERT_ERROR_MESSAGE)
  })
}

/**
 * Ignore an alert
 * @memberOf API
 * @throws {Error}
 */
function ignoreAlertFromAPI (uuid) {
  return fetch(`/bff/v1/operational_alerts/${uuid}/ignore`, {
    method: 'PUT'
  }).then(response => {
    if (response.status !== CREATED) {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(IGNORE_ALERT_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(IGNORE_ALERT_ERROR_MESSAGE)
  })
}

export {
  getOperationalAlertsFromAPI,
  validateAlertFromAPI,
  ignoreAlertFromAPI
}
