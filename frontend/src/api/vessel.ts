import {
  getVesselIdentityFromLegacyVesselIdentity,
  getVesselIdentityPropsAsEmptyStringsWhenUndefined
} from '@features/Vessel/utils'
import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApiKy } from './api'
import { HttpStatusCode } from './constants'

import type { TrackRequest, VesselAndPositions, VesselIdentity, VesselPosition } from '../domain/entities/vessel/types'

const VESSEL_POSITIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations du navire"
const VESSEL_SEARCH_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les navires dans notre base"

/**
 * Get vessel information and positions
 *
 * @throws {@link FrontendApiError}
 */
async function getVesselFromAPI(vesselIdentity: VesselIdentity, trackRequest: TrackRequest) {
  const { externalReferenceNumber, internalReferenceNumber, ircs, vesselId, vesselIdentifier } =
    getVesselIdentityPropsAsEmptyStringsWhenUndefined(getVesselIdentityFromLegacyVesselIdentity(vesselIdentity))
  const trackDepth = trackRequest.trackDepth ?? ''
  const afterDateTime = trackRequest.afterDateTime?.toISOString() ?? ''
  const beforeDateTime = trackRequest.beforeDateTime?.toISOString() ?? ''

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
    throw new FrontendApiError(VESSEL_POSITIONS_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/**
 * Get vessel positions
 *
 * @throws {@link FrontendApiError}
 */
async function getVesselPositionsFromAPI(identity: VesselIdentity, trackRequest: TrackRequest) {
  const { externalReferenceNumber, internalReferenceNumber, ircs, vesselIdentifier } =
    getVesselIdentityPropsAsEmptyStringsWhenUndefined(getVesselIdentityFromLegacyVesselIdentity(identity))
  const trackDepth = trackRequest.trackDepth ?? ''
  const afterDateTime = trackRequest.afterDateTime?.toISOString() ?? ''
  const beforeDateTime = trackRequest.beforeDateTime?.toISOString() ?? ''

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
    throw new FrontendApiError(VESSEL_POSITIONS_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

/** @deprecated Use Redux RTK `searchVessels()` query. */
async function searchVesselsFromAPI(searched: string) {
  const encodedSearched = encodeURI(searched) || ''

  try {
    return await monitorfishApiKy.get(`/bff/v1/vessels/search?searched=${encodedSearched}`).json<VesselIdentity[]>()
  } catch (err) {
    throw new FrontendApiError(VESSEL_SEARCH_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}

export { searchVesselsFromAPI, getVesselPositionsFromAPI, getVesselFromAPI }
