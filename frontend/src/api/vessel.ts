import ky, { HTTPError } from 'ky'

import { ApiError } from '../libs/ApiError'
import { ACCEPTED, NOT_FOUND } from './api'

import type { RiskFactor } from '../domain/entities/vessel/riskFactor/types'
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
const RISK_FACTOR_ERROR_MESSAGE = "Nous n'avons pas pu récuperer le facteur de risque du navire"

/**
 * Get all vessels last positions
 *
 * @throws {@link ApiError}
 */
async function getVesselsLastPositionsFromAPI() {
  try {
    return await ky.get('/bff/v1/vessels').json<VesselLastPosition[]>()
  } catch (err) {
    throw new ApiError(LAST_POSITIONS_ERROR_MESSAGE, err)
  }
}

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
    return await ky
      .get(
        `/bff/v1/vessels/find?vesselId=${vesselId}&internalReferenceNumber=${internalReferenceNumber}&externalReferenceNumber=${externalReferenceNumber}&IRCS=${ircs}&vesselIdentifier=${vesselIdentifier}&trackDepth=${trackDepth}&afterDateTime=${afterDateTime}&beforeDateTime=${beforeDateTime}`
      )
      .then(response =>
        response.json<VesselAndPositions>().then(vesselAndPositions => ({
          isTrackDepthModified: response.status === ACCEPTED,
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
          isTrackDepthModified: response.status === ACCEPTED,
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
  const nextTripNumber = tripNumber || ''
  const nextVoyageRequest = voyageRequest || ''

  try {
    return await ky
      .get(
        `/bff/v1/vessels/logbook/find?internalReferenceNumber=${internalReferenceNumber}&voyageRequest=${nextVoyageRequest}&tripNumber=${nextTripNumber}`
      )
      .json<VesselVoyage>()
  } catch (err) {
    if (err instanceof HTTPError && err.response.status === NOT_FOUND) {
      return undefined
    }

    throw new ApiError(LOGBOOK_ERROR_MESSAGE, err)
  }
}

/**
 * Get vessel controls
 *
 * @throws {@link ApiError}
 */
async function getVesselControlsFromAPI(vesselId: number, fromDate: Date) {
  try {
    return await ky
      .get(`/bff/v1/vessels/${vesselId}/controls?afterDateTime=${fromDate.toISOString()}`)
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

/**
 * Get vessel risk factor
 *
 * @throws {@link ApiError}
 */
async function getVesselRiskFactorFromAPI(internalReferenceNumber: string) {
  try {
    return await ky
      .get(`/bff/v1/vessels/risk_factor?internalReferenceNumber=${internalReferenceNumber}`)
      .json<RiskFactor>()
  } catch (err) {
    throw new ApiError(RISK_FACTOR_ERROR_MESSAGE, err)
  }
}

export {
  searchVesselsFromAPI,
  getVesselPositionsFromAPI,
  getVesselFromAPI,
  getVesselsLastPositionsFromAPI,
  getVesselControlsFromAPI,
  getVesselVoyageFromAPI,
  getVesselReportingsFromAPI,
  getVesselRiskFactorFromAPI
}
