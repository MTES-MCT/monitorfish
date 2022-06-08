import { OK } from './api'

export const ARCHIVE_REPORTING_ERROR_MESSAGE = 'Nous n\'avons pas pu archiver le signalement'
export const DELETE_REPORTING_ERROR_MESSAGE = 'Nous n\'avons pas pu supprimer le signalement'

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

export {
  archiveReportingFromAPI,
  deleteReportingFromAPI
}
