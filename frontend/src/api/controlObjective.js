import { OK } from './api'

export const CONTROL_OBJECTIVES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les objectifs de contrôle'
export const UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE = 'Nous n\'avons pas pu mettre à jour l\'objectifs de contrôle'

/**
 * Get control Objectives
 * @memberOf API
 * @returns {Promise<ControlObjective[]>} The control objectives
 * @throws {Error}
 */
function getControlObjectivesFromAPI () {
  return fetch('/bff/v1/control_objectives')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(CONTROL_OBJECTIVES_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(CONTROL_OBJECTIVES_ERROR_MESSAGE)
    })
}

/**
 * Update a control Objective
 * @memberOf API
 * @param {string} id - The id of the control objective
 * @param {UpdateControlObjective} updatedFields - The fields to update
 * @returns {Promise} The control objectives
 * @throws {Error}
 */
function updateControlObjectiveFromAPI (id, updatedFields) {
  return fetch(`/bff/v1/control_objectives/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(updatedFields)
  }).then(response => {
    if (response.status !== OK) {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE)
  })
}

export {
  updateControlObjectiveFromAPI,
  getControlObjectivesFromAPI
}
