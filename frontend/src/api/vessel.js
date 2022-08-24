import { ACCEPTED, NOT_FOUND, OK } from './api'

const LAST_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les dernières positions"
const VESSEL_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations du navire"
const VESSEL_SEARCH_ERROR_MESSAGE = "Nous n'avons pas pu chercher les navires dans notre base"
const LOGBOOK_ERROR_MESSAGE = "Nous n'avons pas pu chercher les messages JPE de ce navire"
const CONTROLS_ERROR_MESSAGE = "Nous n'avons pas pu récuperer les contrôles de ce navire"
const REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu récuperer les signalements de ce navire"

/**
 * Get all vessels last positions
 * @memberOf API
 * @returns {Promise<VesselLastPosition>} The vessels
 * @throws {Error}
 */
function getVesselsLastPositionsFromAPI() {
  return fetch('/bff/v1/vessels')
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(LAST_POSITIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(LAST_POSITIONS_ERROR_MESSAGE)
    })
    .then(vessels => vessels)
}

/**
 * Get vessel information and positions
 * @memberOf API
 * @returns {Promise<{
 *   vesselAndPositions: {
 *     vessel: Vessel,
 *     positions: VesselPosition[]
 *   },
 *   trackDepthHasBeenModified: boolean
 * }>} The vessel
 * @throws {Error}
 */
function getVesselFromAPI(identity, trackRequest) {
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || ''
  const trackDepth = trackRequest.trackDepth || ''
  const afterDateTime = trackRequest.afterDateTime?.toISOString() || ''
  const beforeDateTime = trackRequest.beforeDateTime?.toISOString() || ''

  return fetch(
    `/bff/v1/vessels/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`,
  )
    .then(response => {
      if (response.status === OK || response.status === ACCEPTED) {
        return response.json().then(vesselAndPositions => ({
          trackDepthHasBeenModified: response.status === ACCEPTED,
          vesselAndPositions,
        }))
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
    })
    .then(vessel => vessel)
}

/**
 * Get vessel positions
 * @memberOf API
 * @param {VesselIdentity} identity
 * @param {TrackRequest} trackRequest
 * @returns {Promise<{
 *   positions: VesselPosition[],
 *   trackDepthHasBeenModified: boolean
 * }>} The positions
 * @throws {Error}
 */
function getVesselPositionsFromAPI(identity, trackRequest) {
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || ''
  const trackDepth = trackRequest.trackDepth || ''
  const afterDateTime = trackRequest.afterDateTime?.toISOString() || ''
  const beforeDateTime = trackRequest.beforeDateTime?.toISOString() || ''

  return fetch(
    `/bff/v1/vessels/positions?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`,
  )
    .then(response => {
      if (response.status === OK || response.status === ACCEPTED) {
        return response.json().then(positions => ({
          positions,
          trackDepthHasBeenModified: response.status === ACCEPTED,
        }))
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(VESSEL_POSITIONS_ERROR_MESSAGE)
    })
    .then(positions => positions)
}

function searchVesselsFromAPI(searched) {
  searched = encodeURI(searched) || ''

  return fetch(`/bff/v1/vessels/search?searched=${searched}`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(VESSEL_SEARCH_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(VESSEL_SEARCH_ERROR_MESSAGE)
    })
}

/**
 * Get vessel voyage
 * @memberOf API
 * @returns {Promise<VesselVoyage>} The voyage
 * @throws {Error}
 */
function getVesselVoyageFromAPI(vesselIdentity, voyageRequest, tripNumber) {
  const internalReferenceNumber = vesselIdentity.internalReferenceNumber || ''
  const externalReferenceNumber = vesselIdentity.externalReferenceNumber || ''
  const ircs = vesselIdentity.ircs || ''
  tripNumber = tripNumber || ''
  voyageRequest = voyageRequest || ''

  return fetch(
    `/bff/v1/vessels/logbook/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&voyageRequest=${voyageRequest}&tripNumber=${tripNumber}`,
  )
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      if (response.status === NOT_FOUND) {
        response.text().then(text => {
          console.error(text)
        })

        return null
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(LOGBOOK_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(LOGBOOK_ERROR_MESSAGE)
    })
    .then(logbook => logbook)
}

/**
 * Get vessel controls
 * @memberOf API
 * @returns {Promise<ControlResume>} The vessels
 * @throws {Error}
 */
function getVesselControlsFromAPI(vesselId, fromDate) {
  return fetch(`/bff/v1/vessels/${vesselId}/controls?afterDateTime=${fromDate.toISOString()}`)
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(CONTROLS_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(CONTROLS_ERROR_MESSAGE)
    })
    .then(controls => controls)
}

/**
 * Get vessel reporting
 * @memberOf API
 * @returns {Promise<CurrentAndArchivedReportings>} The reportings
 * @throws {Error}
 */
function getVesselReportingsFromAPI(identity, fromDate) {
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || ''

  return fetch(
    `/bff/v1/vessels/reporting?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&fromDate=${fromDate.toISOString()}`,
  )
    .then(response => {
      if (response.status === OK) {
        return response.json()
      }
      response.text().then(text => {
        console.error(text)
      })
      throw Error(REPORTING_ERROR_MESSAGE)
    })
    .catch(error => {
      console.error(error)
      throw Error(REPORTING_ERROR_MESSAGE)
    })
    .then(reporting => reporting)
}

export {
  searchVesselsFromAPI,
  getVesselPositionsFromAPI,
  getVesselFromAPI,
  getVesselsLastPositionsFromAPI,
  getVesselControlsFromAPI,
  getVesselVoyageFromAPI,
  getVesselReportingsFromAPI,
}
