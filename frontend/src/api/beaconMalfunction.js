import { CREATED, OK } from './api'

export const BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les avaries VMS"
export const BEACON_MALFUNCTION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer l'avarie VMS"
export const UPDATE_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour le statut de l'avarie VMS"
export const SAVE_BEACON_MALFUNCTION_COMMENT_ERROR_MESSAGE =
  "Nous n'avons pas pu ajouter le commentaire sur l'avarie VMS"
export const VESSEL_BEACON_MALFUNCTIONS_ERROR_MESSAGE = "Nous n'avons pas pu chercher les avaries de ce navire"
export const SEND_NOTIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu envoyer la notification"

/**
 * Get all beacon malfunctions
 * @memberOf API
 * @returns {Promise<BeaconMalfunction[]>} The beacon malfunctions
 * @throws {Error}
 */
function getAllBeaconMalfunctionsFromAPI() {
  return fetch('/bff/v1/beacon_malfunctions')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(BEACON_MALFUNCTIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(BEACON_MALFUNCTIONS_ERROR_MESSAGE)
    })
}

/**
 * Update a beacon malfunction
 * @memberOf API
 * @param {number} id - The id of the beacon malfunction
 * @param {UpdateBeaconMalfunction} updatedFields - The fields to update
 * @throws {Error}
 */
function updateBeaconMalfunctionFromAPI(id, updatedFields) {
  return fetch(`/bff/v1/beacon_malfunctions/${id}`, {
    body: JSON.stringify(updatedFields),
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8',
    },
    method: 'PUT',
  })
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(UPDATE_BEACON_MALFUNCTIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(UPDATE_BEACON_MALFUNCTIONS_ERROR_MESSAGE)
    })
}

/**
 * Get a beacon malfunction
 * @memberOf API
 * @returns {Promise<BeaconMalfunctionResumeAndDetails>} The beacon malfunction with details
 * @throws {Error}
 */
function getBeaconMalfunctionFromAPI(beaconMalfunctionId) {
  return fetch(`/bff/v1/beacon_malfunctions/${beaconMalfunctionId}`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(BEACON_MALFUNCTION_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(BEACON_MALFUNCTION_ERROR_MESSAGE)
    })
}

/**
 * Save a new comment attached to a beacon malfunction
 * @memberOf API
 * @param {string} id - The id of the beacon malfunction
 * @param {BeaconMalfunctionCommentInput} comment - The fields to update
 * @throws {Error}
 */
function saveBeaconMalfunctionCommentFromAPI(id, comment) {
  return fetch(`/bff/v1/beacon_malfunctions/${id}/comments`, {
    body: JSON.stringify(comment),
    headers: {
      Accept: 'application/json, text/plain',
      'Content-Type': 'application/json;charset=UTF-8',
    },
    method: 'POST',
  })
    .then(response => {
      if (response.status === CREATED) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(SAVE_BEACON_MALFUNCTION_COMMENT_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(SAVE_BEACON_MALFUNCTION_COMMENT_ERROR_MESSAGE)
    })
}

/**
 * Get vessel beacon malfunctions
 * @memberOf API
 * @returns {Promise<VesselBeaconMalfunctionsResumeAndHistory>} The beacon malfunctions resume and history
 * @throws {Error}
 */
function getVesselBeaconsMalfunctionsFromAPI(vesselIdentity, fromDate) {
  const internalReferenceNumber = vesselIdentity.internalReferenceNumber || ''
  const externalReferenceNumber = vesselIdentity.externalReferenceNumber || ''
  const ircs = vesselIdentity.ircs || ''
  const vesselIdentifier = vesselIdentity.vesselIdentifier || ''

  return fetch(
    `/bff/v1/vessels/beacon_malfunctions?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&afterDateTime=${fromDate.toISOString()}`,
  )
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(VESSEL_BEACON_MALFUNCTIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(VESSEL_BEACON_MALFUNCTIONS_ERROR_MESSAGE)
    })
}

/**
 * Send a notification - Update the request notification column to asynchronously send the message
 * @memberOf API
 * @param {number} id - The id of the beacon malfunction
 * @param {string} notificationType
 * @throws {Error}
 */
function sendNotificationFromAPI(id, notificationType) {
  return fetch(`/bff/v1/beacon_malfunctions/${id}/${notificationType}`, {
    method: 'PUT',
  })
    .then(response => {
      if (response.status !== OK) {
        response.text().then(text => {
          console.error(text)
        })
        throw Error(SEND_NOTIFICATION_ERROR_MESSAGE)
      }
    })
    .catch(error => {
      console.error(error)
      throw Error(SEND_NOTIFICATION_ERROR_MESSAGE)
    })
}

export {
  getVesselBeaconsMalfunctionsFromAPI,
  saveBeaconMalfunctionCommentFromAPI,
  getBeaconMalfunctionFromAPI,
  updateBeaconMalfunctionFromAPI,
  getAllBeaconMalfunctionsFromAPI,
  sendNotificationFromAPI,
}
