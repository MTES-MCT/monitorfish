import { OK } from './api'

export const FLEET_SEGMENT_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les segments de flotte'
export const UPDATE_FLEET_SEGMENT_ERROR_MESSAGE = 'Nous n\'avons pas pu modifier le segment de flotte'

/**
 * Get Fleet segments
 * @memberOf API
 * @returns {Promise<FleetSegment[]>} The fleet segments
 * @throws {Error}
 */
function getAllFleetSegmentFromAPI () {
  return fetch('/bff/v1/fleet_segments')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(FLEET_SEGMENT_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(FLEET_SEGMENT_ERROR_MESSAGE)
    })
}

/**
 * Update a fleet segment
 * @memberOf API
 * @param {string} segment - The fleet segment
 * @param {UpdateFleetSegment} updatedFields - The fields to update
 * @returns {Promise<FleetSegment>} The updated fleet segment
 * @throws {Error}
 */
function updateFleetSegmentFromAPI (segment, updatedFields) {
  return fetch(`/bff/v1/fleet_segments/${segment}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(updatedFields)
  }).then(response => {
    if (response.status === OK) {
      return response.json()
    } else {
      response.text().then(text => {
        console.error(text)
      })
      throw Error(UPDATE_FLEET_SEGMENT_ERROR_MESSAGE)
    }
  }).catch(error => {
    console.error(error)
    throw Error(UPDATE_FLEET_SEGMENT_ERROR_MESSAGE)
  })
}

export {
  getAllFleetSegmentFromAPI,
  updateFleetSegmentFromAPI
}
