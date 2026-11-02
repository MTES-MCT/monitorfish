import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'
import { parseOrReturn } from '@utils/parseOrReturn.ts'

import { VesselRiskElementSchema } from './schemas'

import type { RiskElement } from './types'

const GET_VESSEL_RISK_ELEMENTS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les éléments de risque de ce navire."

export const riskElementApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getVesselRiskElements: builder.query<RiskElement.VesselRiskElement[], string>({
      // Risk elements embed reportings, which can be archived or deleted from the sidebar
      providesTags: () => [{ type: RtkCacheTagType.Reportings }],
      query: internalReferenceNumber =>
        getUrlOrPathWithQueryParams('/vessels/risk_elements', { internalReferenceNumber }),
      transformErrorResponse: response => new FrontendApiError(GET_VESSEL_RISK_ELEMENTS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: RiskElement.VesselRiskElement[]) =>
        parseOrReturn<RiskElement.VesselRiskElement>(baseQueryReturnValue, VesselRiskElementSchema, true)
    })
  })
})

export const { useGetVesselRiskElementsQuery } = riskElementApi
