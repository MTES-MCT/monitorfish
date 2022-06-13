import { OK } from './api'

export const ALERTS_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les alertes opérationelles'
export const VALIDATE_ALERT_ERROR_MESSAGE = 'Nous n\'avons pas pu valider l\'alerte opérationelle'
export const SILENCE_ALERT_ERROR_MESSAGE = 'Nous n\'avons pas pu ignorer l\'alerte opérationelle'
export const DELETE_SILENCED_ALERT_ERROR_MESSAGE = 'Nous n\'avons pas pu réactiver l\'alerte opérationelle'

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
 * @param {int} id
 * @throws {Error}
 */
function validateAlertFromAPI (id) {
  return fetch(`/bff/v1/operational_alerts/${id}/validate`, {
    method: 'PUT'
  }).then(response => {
    if (response.status !== OK) {
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
 * Silence an alert and returns the saved silenced alert
 * @memberOf API
 * @param {int} id
 * @param {SilencedAlertPeriodRequest} silencedAlertPeriodRequest
 * @return {SilencedAlert} silencedAlert
 * @throws {Error}
 */
function silenceAlertFromAPI (id, silencedAlertPeriodRequest) {
  const silencedAlertPeriod = silencedAlertPeriodRequest.silencedAlertPeriod || ''
  const afterDateTime = silencedAlertPeriodRequest.afterDateTime?.toISOString() || ''
  const beforeDateTime = silencedAlertPeriodRequest.beforeDateTime?.toISOString() || ''

  return fetch(`/bff/v1/operational_alerts/${id}/silence`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({
      silencedAlertPeriod: silencedAlertPeriod,
      afterDateTime: afterDateTime,
      beforeDateTime: beforeDateTime
    })
  }).then(response => {
    if (response.status === OK) {
      return response.json()
    } else {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(SILENCE_ALERT_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(SILENCE_ALERT_ERROR_MESSAGE)
  })
}

/**
 * Get silenced alerts
 * @memberOf API
 * @returns {Promise<SilencedAlert[]>} The silenced alerts
 * @throws {Error}
 */
function getSilencedAlertsFromAPI () {
  return fetch('/bff/v1/operational_alerts/silenced')
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
 * Delete a silenced alert
 * @memberOf API
 * @param id silenced alert id
 * @throws {Error}
 */
function deleteSilencedAlertFromAPI (id) {
  return fetch(`/bff/v1/operational_alerts/silenced/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.status !== OK) {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(DELETE_SILENCED_ALERT_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(DELETE_SILENCED_ALERT_ERROR_MESSAGE)
    })
}

export {
  getOperationalAlertsFromAPI,
  validateAlertFromAPI,
  silenceAlertFromAPI,
  getSilencedAlertsFromAPI,
  deleteSilencedAlertFromAPI
}
