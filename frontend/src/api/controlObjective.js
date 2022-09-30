import { CREATED, OK } from './api'

export const CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les objectifs de contrôle"
export const CONTROL_OBJECTIVE_YEARS_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer les années des objectifs de contrôle"
export const UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour l'objectif de contrôle"
export const DELETE_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu supprimer l'objectif de contrôle"
export const ADD_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu ajouter l'objectif de contrôle"
export const ADD_CONTROL_OBJECTIVES_YEAR_ERROR_MESSAGE = "Nous n'avons pas pu ajouter une nouvelle année"

/**
 * Get control Objectives
 * @memberOf API
 * @param {string} year - The year of the control objectives to fetch
 * @returns {Promise<ControlObjective[]>} The control objectives
 * @throws {Error}
 */
function getControlObjectivesFromAPI(year) {
  return fetch(`/bff/v1/control_objectives/${year}`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
}

/**
 * Get control Objective year entries
 * @memberOf API
 * @returns {Promise<ControlObjective[]>} The years
 * @throws {Error}
 */
function getControlObjectiveYearEntriesFromAPI() {
  return fetch('/bff/v1/control_objectives/years')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(CONTROL_OBJECTIVE_YEARS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(CONTROL_OBJECTIVE_YEARS_ERROR_MESSAGE)
    })
}

/**
 * Update a control Objective
 * @memberOf API
 * @param {string} id - The id of the control objective
 * @param {UpdateControlObjective} updatedFields - The fields to update
 * @throws {Error}
 */
function updateControlObjectiveFromAPI(id, updatedFields) {
  return fetch(`/bff/v1/control_objectives/${id}`, {
    body: JSON.stringify(updatedFields),
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
        throw Error(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
}

/**
 * Delete a control Objective
 * @memberOf API
 * @param {string} id - The id of the control objective
 * @throws {Error}
 */
function deleteControlObjectiveFromAPI(id) {
  return fetch(`/bff/v1/control_objectives/${id}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.status !== OK) {
        throw Error(DELETE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(DELETE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
}

/**
 * Add a control Objective
 * @memberOf API
 * @param {string} segment - The segment of the control objective
 * @param {string} facade - The facade of the control objective
 * @param {int} year - The year of the control objective
 * @returns {Promise} The control objectives
 * @throws {Error}
 */
function addControlObjectiveFromAPI(segment, facade, year) {
  const createFields = {
    facade,
    segment,
    year
  }

  return fetch('/bff/v1/control_objectives', {
    body: JSON.stringify(createFields),
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'POST'
  })
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(ADD_CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(ADD_CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
}

/**
 * Add a new control Objective year
 * @memberOf API
 * @throws {Error}
 */
function addControlObjectiveYearFromAPI() {
  return fetch('/bff/v1/control_objectives/years', {
    method: 'POST'
  })
    .then(response => {
      if (response.status !== CREATED) {
        throw Error(ADD_CONTROL_OBJECTIVES_YEAR_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(ADD_CONTROL_OBJECTIVES_YEAR_ERROR_MESSAGE)
    })
}

export {
  updateControlObjectiveFromAPI,
  getControlObjectivesFromAPI,
  getControlObjectiveYearEntriesFromAPI,
  deleteControlObjectiveFromAPI,
  addControlObjectiveFromAPI,
  addControlObjectiveYearFromAPI
}
