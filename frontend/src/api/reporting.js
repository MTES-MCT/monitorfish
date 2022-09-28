import { CREATED, OK } from './api'

export const ARCHIVE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu archiver le signalement"
export const ARCHIVE_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu archiver les signalements"
export const DELETE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le signalement"
export const DELETE_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu supprimer les signalements"
export const UPDATE_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu éditer le signalement"
export const ADD_REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu créer le signalement"
export const GET_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu créer les signalements"

/**
 * Archive a reporting
 * @memberOf API
 * @param {number} id - The id of the reporting
 * @throws {Error}
 */
function archiveReportingFromAPI(id) {
  return fetch(`/bff/v1/reportings/${id}/archive`, {
    method: 'PUT'
  })
    .then(response => {
      if (response.status !== OK) {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(ARCHIVE_REPORTING_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(ARCHIVE_REPORTING_ERROR_MESSAGE)
    })
}

/**
 * Archive multiple reportings
 * @memberOf API
 * @param {number[]} ids - The ids of the reportings
 * @throws {Error}
 */
function archiveReportingsFromAPI(ids) {
  return fetch(`/bff/v1/reportings/archive`, {
    body: JSON.stringify(ids),
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'PUT'
  })
    .then(response => {
      if (response.status !== OK) {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(ARCHIVE_REPORTINGS_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(ARCHIVE_REPORTINGS_ERROR_MESSAGE)
    })
}

/**
 * Delete a reporting
 * @memberOf API
 * @param {number} id - The id of the reporting
 * @throws {Error}
 */
function deleteReportingFromAPI(id) {
  return fetch(`/bff/v1/reportings/${id}/delete`, {
    method: 'PUT'
  })
    .then(response => {
      if (response.status !== OK) {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(DELETE_REPORTING_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(DELETE_REPORTING_ERROR_MESSAGE)
    })
}

/**
 * Delete multiple reportings
 * @memberOf API
 * @param {string[]} ids - The ids of the reportings
 * @throws {Error}
 */
function deleteReportingsFromAPI(ids) {
  return fetch('/bff/v1/reportings/delete', {
    body: JSON.stringify(ids),
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'PUT'
  })
    .then(response => {
      if (response.status !== OK) {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(DELETE_REPORTINGS_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(DELETE_REPORTINGS_ERROR_MESSAGE)
    })
}

/**
 * Add a reporting
 * @memberOf API
 * @param {Reporting} newReporting - The reporting to add
 * @return {Reporting} reporting - The added reporting

 * @throws {Error}
 */
function addReportingFromAPI(newReporting) {
  return fetch('/bff/v1/reportings', {
    body: JSON.stringify(newReporting),
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'POST'
  })
    .then(response => {
      if (response.status === CREATED) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(ADD_REPORTING_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(ADD_REPORTING_ERROR_MESSAGE)
    })
}

/**
 * Update a reporting
 * @memberOf API
 * @param {string[]} id - The id of the reporting
 * @param {UpdateReporting} nextReporting - The updated reporting
 * @return {Reporting} reporting - The updated reporting
 * @throws {Error}
 */
function updateReportingFromAPI(id, nextReporting) {
  return fetch(`/bff/v1/reportings/${id}/update`, {
    body: JSON.stringify(nextReporting),
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'PUT'
  })
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(UPDATE_REPORTING_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(UPDATE_REPORTING_ERROR_MESSAGE)
    })
}

/**
 * Get all current reportings
 * @memberOf API
 * @returns {Promise<Reporting[]>} The reportings
 * @throws {Error}
 */
function getAllCurrentReportingsFromAPI() {
  return fetch('/bff/v1/reportings')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(GET_REPORTINGS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(GET_REPORTINGS_ERROR_MESSAGE)
    })
}

export {
  archiveReportingFromAPI,
  archiveReportingsFromAPI,
  deleteReportingFromAPI,
  deleteReportingsFromAPI,
  addReportingFromAPI,
  updateReportingFromAPI,
  getAllCurrentReportingsFromAPI
}
