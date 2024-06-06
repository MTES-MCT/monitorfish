import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApi } from '../../api/api'

import type { Vessel } from './Vessel.types'

const GET_VESSEL_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le préavis."

export const vesselApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getVessel: builder.query<Vessel.NextVessel, number>({
      providesTags: () => [{ type: RtkCacheTagType.Vessel }],
      query: logbookMessageReportId => `/vessels/${logbookMessageReportId}`,
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetVesselQuery } = vesselApi
