import { HttpStatusCode } from './constants'
import { monitorfishApiKy } from './index'
import { ApiError } from '../libs/ApiError'

import type { TrackRequest, VesselAndPositions, VesselIdentity, VesselPosition } from '../domain/entities/vessel/types'
import type { CurrentAndArchivedReportingsOfSelectedVessel } from '../domain/types/reporting'

const VESSEL_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations du navire"
const VESSEL_SEARCH_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les navires dans notre base"
const REPORTING_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les signalements de ce navire"

function getVesselIdentityAsEmptyStringWhenNull(identity: VesselIdentity) {
  const vesselId = identity.vesselId || ''
  const internalReferenceNumber = identity.internalReferenceNumber || ''
  const externalReferenceNumber = identity.externalReferenceNumber || ''
  const ircs = identity.ircs || ''
  const vesselIdentifier = identity.vesselIdentifier || ''

  return { externalReferenceNumber, internalReferenceNumber, ircs, vesselId, vesselIdentifier }
}

/**
 * Get vessel information and positions
 *
 * @throws {@link ApiError}
 */
async function getVesselFromAPI(identity: VesselIdentity, trackRequest: TrackRequest) {
  const { externalReferenceNumber, internalReferenceNumber, ircs, vesselId, vesselIdentifier } =
    getVesselIdentityAsEmptyStringWhenNull(identity)
  const trackDepth = trackRequest.trackDepth || ''
  const afterDateTime = trackRequest.afterDateTime?.toISOString() || ''
  const beforeDateTime = trackRequest.beforeDateTime?.toISOString() || ''

  try {
    return await monitorfishApiKy
      .get(
        `/bff/v1/vessels/find?vesselId=${vesselId}&internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`
      )
      .then(response =>
        response.json<VesselAndPositions>().then(vesselAndPositions => ({
          isTrackDepthModified: response.status === HttpStatusCode.ACCEPTED,
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
    return await monitorfishApiKy
      .get(
        `/bff/v1/vessels/positions?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`
      )
      .then(response =>
        response.json<VesselPosition[]>().then(positions => ({
          isTrackDepthModified: response.status === HttpStatusCode.ACCEPTED,
          positions
        }))
      )
  } catch (err) {
    throw new ApiError(VESSEL_POSITIONS_ERROR_MESSAGE, err)
  }
}

async function searchVesselsFromAPI(searched: string) {
  const encodedSearched = encodeURI(searched) || ''

  try {
    return await monitorfishApiKy.get(`/bff/v1/vessels/search?searched=${encodedSearched}`).json<VesselIdentity[]>()
  } catch (err) {
    throw new ApiError(VESSEL_SEARCH_ERROR_MESSAGE, err)
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
    return await monitorfishApiKy
      .get(
        `/bff/v1/vessels/reporting?internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&fromDate=${fromDate.toISOString()}`
      )
      .json<CurrentAndArchivedReportingsOfSelectedVessel>()
  } catch (err) {
    throw new ApiError(REPORTING_ERROR_MESSAGE, err)
  }
}

export { searchVesselsFromAPI, getVesselPositionsFromAPI, getVesselFromAPI, getVesselReportingsFromAPI }
