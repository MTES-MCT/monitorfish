import { monitorfishApi, monitorfishLightApi } from '../../api'

import type { RiskFactor } from '../../domain/entities/vessel/riskFactor/types'
import type { VesselLastPosition } from '../../domain/entities/vessel/types'

export const vesselApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getRiskFactor: builder.query<RiskFactor, string>({
      providesTags: () => [{ type: 'RiskFactor' }],
      query: internalReferenceNumber => `/vessels/risk_factor?internalReferenceNumber=${internalReferenceNumber}`
    }),
    getVesselsLastPositions: builder.query<VesselLastPosition[], void>({
      query: () => `/vessels`
    })
  })
})

export const vesselNavApi = monitorfishLightApi.injectEndpoints({
  endpoints: builder => ({
    getVesselsLastPositions: builder.query<VesselLastPosition[], void>({
      query: () => `/v1/vessels`
    })
  })
})

export const { useGetRiskFactorQuery, useGetVesselsLastPositionsQuery } = vesselApi

export const { useGetVesselsLastPositionsQuery: useGetVesselsLastPositionsNavQuery } = vesselNavApi
