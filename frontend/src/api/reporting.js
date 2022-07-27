import { CREATED, OK } from './api'

export const ARCHIVE_REPORTING_ERROR_MESSAGE = 'Nous n\'avons pas pu archiver le signalement'
export const DELETE_REPORTING_ERROR_MESSAGE = 'Nous n\'avons pas pu supprimer le signalement'
export const ADD_REPORTING_ERROR_MESSAGE = 'Nous n\'avons pas pu créer le signalement'
export const GET_REPORTINGS_ERROR_MESSAGE = 'Nous n\'avons pas pu créer les signalements'

/**
 * Archive a reporting
 * @memberOf API
 * @param {number} id - The id of the reporting
 * @throws {Error}
 */
function archiveReportingFromAPI (id) {
  return fetch(`/bff/v1/reportings/${id}/archive`, {
    method: 'PUT'
  }).then(response => {
    if (response.status !== OK) {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(ARCHIVE_REPORTING_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(ARCHIVE_REPORTING_ERROR_MESSAGE)
  })
}

/**
 * Delete a reporting
 * @memberOf API
 * @param {number} id - The id of the reporting
 * @throws {Error}
 */
function deleteReportingFromAPI (id) {
  return fetch(`/bff/v1/reportings/${id}/delete`, {
    method: 'PUT'
  }).then(response => {
    if (response.status !== OK) {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(DELETE_REPORTING_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(DELETE_REPORTING_ERROR_MESSAGE)
  })
}

/**
 * Add a reporting
 * @memberOf API
 * @param {number} newReporting - The reporting to add
 * @return {Reporting} reporting - The added reporting

 * @throws {Error}
 */
function addReportingFromAPI (newReporting) {
  return fetch('/bff/v1/reportings', {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(newReporting)
  }).then(response => {
    if (response.status === CREATED) {
      return response.json()
    } else {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(ADD_REPORTING_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(ADD_REPORTING_ERROR_MESSAGE)
  })
}

/**
 * Get all current reportings
 * @memberOf API
 * @returns {Promise<Reporting[]>} The reportings
 * @throws {Error}
 */
function getAllCurrentReportingsFromAPI () {
  return fetch('/bff/v1/reportings')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(GET_REPORTINGS_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(GET_REPORTINGS_ERROR_MESSAGE)
    })
}

export {
  archiveReportingFromAPI,
  deleteReportingFromAPI,
  addReportingFromAPI,
  getAllCurrentReportingsFromAPI
}
