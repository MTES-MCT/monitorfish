import { monitorfishApi, monitorfishLightApi } from '../../api/api'

import type { Vessel } from './Vessel.types'
import type { RiskFactor } from '../../domain/entities/vessel/riskFactor/types'
import type { VesselLastPosition } from '../../domain/entities/vessel/types'

export const vesselApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getRiskFactor: builder.query<RiskFactor, string>({
      providesTags: () => [{ type: 'RiskFactor' }],
      query: internalReferenceNumber => `/vessels/risk_factor?internalReferenceNumber=${internalReferenceNumber}`
    }),

    getVessel: builder.query<Vessel.Vessel, number>({
      query: vesselId => `/vessels/${vesselId}`
    }),

    getVesselsLastPositions: builder.query<VesselLastPosition[], void>({
      query: () => `/vessels`
    })
  })
})

export const { useGetRiskFactorQuery, useGetVesselQuery, useGetVesselsLastPositionsQuery } = vesselApi

export const vesselNavApi = monitorfishLightApi.injectEndpoints({
  endpoints: builder => ({
    getVesselsLastPositions: builder.query<VesselLastPosition[], void>({
      query: () => `/v1/vessels`
    })
  })
})

export const { useGetVesselsLastPositionsQuery: useGetVesselsLastPositionsNavQuery } = vesselNavApi
