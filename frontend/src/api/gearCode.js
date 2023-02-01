import { HttpStatusCode } from './constants'

export const GEAR_CODES_ERROR_MESSAGE = 'Nous n\'avons pas pu récupérer les codes des engins de pêches'

function getAllGearCodesFromAPI () {
  return fetch('/bff/v1/gears')
    .then(response => {
      if (response.status === HttpStatusCode.OK) {
        return response.json()
      } else {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(GEAR_CODES_ERROR_MESSAGE)
      }
    }).catch(error => {
      console.error(error)
      throw Error(GEAR_CODES_ERROR_MESSAGE)
    })
}

export {
  getAllGearCodesFromAPI
}
