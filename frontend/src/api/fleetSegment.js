import { OK } from './api'

export const FLEET_SEGMENT_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les segments de flotte'

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

export {
  getAllFleetSegmentFromAPI
}
