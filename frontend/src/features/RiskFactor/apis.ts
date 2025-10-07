import { monitorfishApi } from '@api/api'
import { BackendApi } from '@api/BackendApi.types'
import { valueOrUndefinedIfNotFoundOrThrow } from '@api/utils'
import { RiskFactorSchema } from '@features/RiskFactor/types'

import type { RiskFactor } from '@features/RiskFactor/types'

export const riskFactorApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getRiskFactor: builder.query<RiskFactor | undefined, string>({
      providesTags: () => [{ type: 'RiskFactor' }],
      query: internalReferenceNumber => `/vessels/risk_factor?internalReferenceNumber=${internalReferenceNumber}`,
      transformResponse: (response: BackendApi.ResponseBodyError | RiskFactor) => {
        const result = RiskFactorSchema.safeParse(response)

        return valueOrUndefinedIfNotFoundOrThrow<RiskFactor>(result, response)
      }
    })
  })
})
