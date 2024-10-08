import { RtkCacheTagType } from '@api/constants'
import { getVesselIdentityAsEmptyStringWhenNull } from '@api/vessel'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import { monitorfishApi } from '../../api/api'

import type { Vessel } from './Vessel.types'
import type { VesselReportings } from '@features/Reporting/types'
import type { RiskFactor } from 'domain/entities/vessel/riskFactor/types'
import type { VesselIdentity, VesselLastPosition } from 'domain/entities/vessel/types'

const GET_VESSEL_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les informations de ce navire."
const GET_VESSEL_REPORTINGS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les signalements de ce navire."

export const vesselApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getRiskFactor: builder.query<RiskFactor, string>({
      providesTags: () => [{ type: 'RiskFactor' }],
      query: internalReferenceNumber => `/vessels/risk_factor?internalReferenceNumber=${internalReferenceNumber}`
    }),

    getVessel: builder.query<Vessel.Vessel, number>({
      providesTags: () => [{ type: RtkCacheTagType.Vessel }],
      query: id => `/vessels/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_ERROR_MESSAGE, response)
    }),

    getVesselReportings: builder.query<VesselReportings, number>({
      providesTags: () => [{ type: RtkCacheTagType.Reportings }],
      query: vesselId => `/vessels/${vesselId}/reportings`,
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_REPORTINGS_ERROR_MESSAGE, response)
    }),

    getVesselReportingsByVesselIdentity: builder.query<
      VesselReportings,
      { fromDate: string; vesselIdentity: VesselIdentity }
    >({
      providesTags: () => [{ type: RtkCacheTagType.Reportings }],
      query: ({ fromDate, vesselIdentity }) =>
        getUrlOrPathWithQueryParams('/vessels/reportings', {
          ...getVesselIdentityAsEmptyStringWhenNull(vesselIdentity),
          fromDate
        }),
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_REPORTINGS_ERROR_MESSAGE, response)
    }),

    getVesselsLastPositions: builder.query<VesselLastPosition[], void>({
      query: () => `/vessels`
    })
  })
})

export const {
  useGetRiskFactorQuery,
  useGetVesselQuery,
  useGetVesselReportingsByVesselIdentityQuery,
  useGetVesselReportingsQuery,
  useGetVesselsLastPositionsQuery
} = vesselApi
