import { BackendApi } from '@api/BackendApi.types'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { NavigateTo } from './constants'
import { Logbook } from './Logbook.types'
import { monitorfishApi } from '../../api/api'

import type { TrackRequest } from '@features/Vessel/types/types'
import type { Vessel } from '@features/Vessel/Vessel.types'

const LOGBOOK_TRIPS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les marées du navire"
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

export const logbookApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getLogbookTrips: builder.query<string[], string>({
      keepUnusedDataFor: 30,
      query: internalReferenceNumber => `/vessels/logbook/trips?internalReferenceNumber=${internalReferenceNumber}`,
      transformErrorResponse: response => new FrontendApiError(LOGBOOK_TRIPS_ERROR_MESSAGE, response)
    }),
    getVesselLogbook: builder.query<Logbook.VesselVoyage | undefined, GetVesselLogbookParams>({
      query: (params: GetVesselLogbookParams) => {
        const { internalReferenceNumber } = params.vesselIdentity
        const { tripNumber, voyageRequest } = params

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
    }),
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

export function isVesselVoyage(response: any): response is Logbook.VesselVoyage {
  return response.logbookMessages !== undefined
}

export const { useGetLogbookTripsQuery } = logbookApi
