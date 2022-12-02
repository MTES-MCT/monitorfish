import ky from 'ky'

import { ApiError } from '../libs/ApiError'
import { ACCEPTED, NOT_FOUND } from './api'

import type {
  TrackRequest,
  VesselAndPositions,
  VesselIdentity,
  VesselLastPosition,
  VesselPosition
} from '../domain/entities/vessel/types'
import type { ControlSummary } from '../domain/types/control'
import type { VesselVoyage } from '../domain/types/fishingActivities'
import type { CurrentAndArchivedReportingsOfSelectedVessel } from '../domain/types/reporting'
import type { NavigateTo } from '../domain/use_cases/vessel/getVesselVoyage'

const LAST_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les dernières positions"
const VESSEL_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations du navire"
const VESSEL_SEARCH_ERROR_MESSAGE = "Nous n'avons pas pu chercher les navires dans notre base"
const LOGBOOK_ERROR_MESSAGE = "Nous n'avons pas pu chercher les messages JPE de ce navire"
const CONTROLS_ERROR_MESSAGE = "Nous n'avons pas pu récuperer les contrôles de ce navire"
const REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu récuperer les signalements de ce navire"

/**
 * Get all vessels last positions
 *
 * @throws {@link ApiError}
 */
async function getVesselsLastPositionsFromAPI() {
  try {
    return await ky.get('/bff/v1/vessels').json<VesselLastPosition>()
  } catch (err) {
    throw new ApiError(LAST_POSITIONS_ERROR_MESSAGE, err)
  }
}

function getVesselIdentityAsEmptyStringWhenNull(identity: VesselIdentity) {
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || ''

  return { externalReferenceNumber, internalReferenceNumber, ircs, vesselIdentifier }
}

/**
 * Get vessel information and positions
 *
 * @throws {@link ApiError}
 */
async function getVesselFromAPI(identity: VesselIdentity, trackRequest: TrackRequest) {
  const { externalReferenceNumber, internalReferenceNumber, ircs, vesselIdentifier } =
    getVesselIdentityAsEmptyStringWhenNull(identity)
  const trackDepth = trackRequest.trackDepth || ''
  const afterDateTime = trackRequest.afterDateTime?.toISOString() || ''
  const beforeDateTime = trackRequest.beforeDateTime?.toISOString() || ''

  try {
    return await ky
      .get(
        `/bff/v1/vessels/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`
      )
      .then(response =>
        response.json<VesselAndPositions>().then(vesselAndPositions => ({
          trackDepthHasBeenModified: response.status === ACCEPTED,
          vesselAndPositions
        }))
      )
  } catch (err) {
    throw new ApiError(VESSEL_POSITIONS_ERROR_MESSAGE, err)
  }
}

/**
 * Get vessel positions
 *
 * @throws {@link ApiError}
 */
async function getVesselPositionsFromAPI(identity: VesselIdentity, trackRequest: TrackRequest) {
  const { externalReferenceNumber, internalReferenceNumber, ircs, vesselIdentifier } =
    getVesselIdentityAsEmptyStringWhenNull(identity)
  const trackDepth = trackRequest.trackDepth || ''
  const afterDateTime = trackRequest.afterDateTime?.toISOString() || ''
  const beforeDateTime = trackRequest.beforeDateTime?.toISOString() || ''

  try {
    return await ky
      .get(
        `/bff/v1/vessels/positions?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`
      )
      .then(response =>
        response.json<VesselPosition[]>().then(positions => ({
          positions,
          trackDepthHasBeenModified: response.status === ACCEPTED
        }))
      )
  } catch (err) {
    throw new ApiError(VESSEL_POSITIONS_ERROR_MESSAGE, err)
  }
}

async function searchVesselsFromAPI(searched: string) {
  const encodedSearched = encodeURI(searched) || ''

  try {
    return await ky.get(`/bff/v1/vessels/search?searched=${encodedSearched}`).json<VesselIdentity[]>()
  } catch (err) {
    throw new ApiError(VESSEL_SEARCH_ERROR_MESSAGE, err)
  }
}

/**
 * Get vessel voyage
 *
 * @throws {@link ApiError}
 */
async function getVesselVoyageFromAPI(
  vesselIdentity: VesselIdentity,
  voyageRequest: NavigateTo | undefined,
  tripNumber: number | undefined
) {
  const internalReferenceNumber = vesselIdentity.internalReferenceNumber || ''
  const externalReferenceNumber = vesselIdentity.externalReferenceNumber || ''
  const ircs = vesselIdentity.ircs || ''
  const nextTripNumber = tripNumber || ''
  const nextVoyageRequest = voyageRequest || ''

  try {
    return await ky
      .get(
        `/bff/v1/vessels/logbook/find?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&voyageRequest=${nextVoyageRequest}&tripNumber=${nextTripNumber}`
      )
      .then(response => {
        if (response.status === NOT_FOUND) {
          return undefined
        }

        return response.json<VesselVoyage>()
      })
  } catch (err) {
    throw new ApiError(LOGBOOK_ERROR_MESSAGE, err)
  }
}

/**
 * Get vessel controls
 *
 * @throws {@link ApiError}
 */
async function getVesselControlsFromAPI(vesselInternalId: number, fromDate: Date) {
  try {
    return await ky
      .get(`/bff/v1/vessels/${vesselInternalId}/controls?afterDateTime=${fromDate.toISOString()}`)
      .json<ControlSummary>()
  } catch (err) {
    throw new ApiError(CONTROLS_ERROR_MESSAGE, err)
  }
}

/**
 * Get vessel reporting
 *
 * @throws {@link ApiError}
 */
async function getVesselReportingsFromAPI(identity: VesselIdentity, fromDate: Date) {
  const { externalReferenceNumber, internalReferenceNumber, ircs, vesselIdentifier } =
    getVesselIdentityAsEmptyStringWhenNull(identity)

  try {
    return await ky
      .get(
        `/bff/v1/vessels/reporting?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&fromDate=${fromDate.toISOString()}`
      )
      .json<CurrentAndArchivedReportingsOfSelectedVessel>()
  } catch (err) {
    throw new ApiError(REPORTING_ERROR_MESSAGE, err)
  }
}

export {
  searchVesselsFromAPI,
  getVesselPositionsFromAPI,
  getVesselFromAPI,
  getVesselsLastPositionsFromAPI,
  getVesselControlsFromAPI,
  getVesselVoyageFromAPI,
  getVesselReportingsFromAPI
}
