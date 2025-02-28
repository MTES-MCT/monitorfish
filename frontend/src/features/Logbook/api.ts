import { BackendApi } from '@api/BackendApi.types'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { NavigateTo } from './constants'
import { Logbook } from './Logbook.types'
import { monitorfishApi, monitorfishLightApi } from '../../api/api'

import type { TrackRequest } from '../../domain/entities/vessel/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

const LAST_LOGBOOK_TRIPS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les dernières marées"
const LOGBOOK_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les messages JPE de ce navire"

export type GetVesselLogbookParams = {
  tripNumber: string | number | undefined
  vesselIdentity: Vessel.VesselIdentity
  voyageRequest: NavigateTo | undefined
}

export type GetVesselLogbookByDatesParams = {
  trackRequest: TrackRequest
  vesselIdentity: Vessel.VesselIdentity
}

const getVesselLogbookQueryArgs = {
  query: params => {
    const { internalReferenceNumber } = params.vesselIdentity
    const { tripNumber } = params
    const { voyageRequest } = params

    return getUrlOrPathWithQueryParams(`/vessels/logbook/find`, {
      internalReferenceNumber: internalReferenceNumber ?? '',
      tripNumber: tripNumber ?? '',
      voyageRequest: voyageRequest ?? ''
    })
  },
  transformErrorResponse: response => new FrontendApiError(LOGBOOK_ERROR_MESSAGE, response),
  transformResponse: (response: BackendApi.ResponseBodyError | Logbook.VesselVoyage) => {
    if (
      !isVesselVoyage(response) &&
      (response as BackendApi.ResponseBodyError).code === BackendApi.ErrorCode.NOT_FOUND_BUT_OK
    ) {
      return undefined
    }

    return response as Logbook.VesselVoyage
  }
}

export const logbookApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getLastLogbookTrips: builder.query<string[], string>({
      providesTags: () => [{ type: 'TripNumbers' }],
      query: internalReferenceNumber => `/vessels/logbook/last?internalReferenceNumber=${internalReferenceNumber}`,
      transformErrorResponse: response => new FrontendApiError(LAST_LOGBOOK_TRIPS_ERROR_MESSAGE, response)
    }),
    getVesselLogbook: builder.query<Logbook.VesselVoyage | undefined, GetVesselLogbookParams>(
      getVesselLogbookQueryArgs
    ),
    getVesselLogbookByDates: builder.query<Logbook.VesselVoyage | undefined, GetVesselLogbookByDatesParams>({
      query: params => {
        const { internalReferenceNumber } = params.vesselIdentity

        return getUrlOrPathWithQueryParams(`/vessels/logbook/find_by_dates`, {
          afterDateTime: params.trackRequest.afterDateTime?.toISOString() ?? '',
          beforeDateTime: params.trackRequest.beforeDateTime?.toISOString() ?? '',
          internalReferenceNumber: internalReferenceNumber ?? '',
          trackDepth: params.trackRequest.trackDepth ?? ''
        })
      },
      transformErrorResponse: response => new FrontendApiError(LOGBOOK_ERROR_MESSAGE, response),
      transformResponse: (response: BackendApi.ResponseBodyError | Logbook.VesselVoyage) => {
        if (
          !isVesselVoyage(response) &&
          (response as BackendApi.ResponseBodyError).code === BackendApi.ErrorCode.NOT_FOUND_BUT_OK
        ) {
          return undefined
        }

        return response as Logbook.VesselVoyage
      }
    })
  })
})

export const logbookLightApi = monitorfishLightApi.injectEndpoints({
  endpoints: builder => ({
    getVesselLogbook: builder.query<Logbook.VesselVoyage | undefined, GetVesselLogbookParams>(getVesselLogbookQueryArgs)
  })
})

export function isVesselVoyage(response: any): response is Logbook.VesselVoyage {
  return response.logbookMessagesAndAlerts !== undefined
}

export const { useGetLastLogbookTripsQuery } = logbookApi
