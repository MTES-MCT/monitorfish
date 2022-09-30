import { OK } from './api'

export const GEAR_CODES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les codes des engins de pêches"

function getAllGearCodesFromAPI() {
  return fetch('/bff/v1/gears')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(GEAR_CODES_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(GEAR_CODES_ERROR_MESSAGE)
    })
}

export { getAllGearCodesFromAPI }
