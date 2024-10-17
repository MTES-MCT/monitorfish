import { FrontendApiError } from '@libs/FrontendApiError'

import { NavigateTo } from './constants'
import { Logbook } from './Logbook.types'
import { monitorfishApi, monitorfishApiKy } from '../../api/api'
import { HttpStatusCode } from '../../api/constants'

import type { VesselIdentity } from '../../domain/entities/vessel/types'

const LOGBOOK_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les messages JPE de ce navire"

export const logbookApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getLastLogbookTrips: builder.query<string[], string>({
      providesTags: () => [{ type: 'TripNumbers' }],
      query: internalReferenceNumber => `/vessels/logbook/last?internalReferenceNumber=${internalReferenceNumber}`
    })
  })
})

export const { useGetLastLogbookTripsQuery } = logbookApi

/**
 * Get vessel logbook.
 * If the vessel has no logbook, an NOT_FOUND (404) API http code is returned from the API.
 *
 * @throws {@link FrontendApiError}
 */
export async function getVesselLogbookFromAPI(
  isInLightMode: boolean,
  vesselIdentity: VesselIdentity,
  voyageRequest: NavigateTo | undefined,
  tripNumber: string | number | undefined
) {
  const internalReferenceNumber = vesselIdentity.internalReferenceNumber ?? ''
  const nextTripNumber = tripNumber ?? ''
  const nextVoyageRequest = voyageRequest ?? ''

  try {
    return await monitorfishApiKy
      .get(
        `/${
          isInLightMode ? 'light' : 'bff'
        }/v1/vessels/logbook/find?internalReferenceNumber=${internalReferenceNumber}&voyageRequest=${nextVoyageRequest}&tripNumber=${nextTripNumber}`
      )
      .json<Logbook.VesselVoyage>()
  } catch (err) {
    if (err instanceof FrontendApiError && err.originalError.status === HttpStatusCode.NOT_FOUND) {
      return undefined
    }

    throw new FrontendApiError(LOGBOOK_ERROR_MESSAGE, (err as FrontendApiError).originalError)
  }
}
