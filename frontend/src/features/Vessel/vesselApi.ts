import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'

import { monitorfishApi } from '../../api/api'

import type { Vessel } from './Vessel.types'

const GET_VESSEL_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le préavis."

export const vesselApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getVessel: builder.query<Vessel.Vessel, number>({
      providesTags: () => [{ type: RtkCacheTagType.Vessel }],
      query: id => `/vessels/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetVesselQuery } = vesselApi
