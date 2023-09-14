import { HTTPError } from 'ky'

import { NavigateTo } from './constants'
import { monitorfishApiKy } from '../../api'
import { HttpStatusCode } from '../../api/constants'
import { ApiError } from '../../libs/ApiError'

import type { VesselVoyage } from './types'
import type { VesselIdentity } from '../../domain/entities/vessel/types'

const LOGBOOK_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les messages JPE de ce navire"

/**
 * Get vessel logbook.
 * If the vessel has no logbook, an NOT_FOUND (404) API http code is returned from the API.
 *
 * @throws {@link ApiError}
 */
export async function getVesselLogbookFromAPI(
  vesselIdentity: VesselIdentity,
  voyageRequest: NavigateTo | undefined,
  tripNumber: number | undefined
) {
  const internalReferenceNumber = vesselIdentity.internalReferenceNumber || ''
  const nextTripNumber = tripNumber || ''
  const nextVoyageRequest = voyageRequest || ''

  try {
    return await monitorfishApiKy
      .get(
        `/bff/v1/vessels/logbook/find?internalReferenceNumber=${internalReferenceNumber}&voyageRequest=${nextVoyageRequest}&tripNumber=${nextTripNumber}`
      )
      .json<VesselVoyage>()
  } catch (err) {
    if (err instanceof HTTPError && err.response.status === HttpStatusCode.NOT_FOUND) {
      return undefined
    }

    throw new ApiError(LOGBOOK_ERROR_MESSAGE, err)
  }
}
