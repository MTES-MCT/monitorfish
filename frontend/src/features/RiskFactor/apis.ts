import { monitorfishApi } from '@api/api'
import { BackendApi } from '@api/BackendApi.types'
import { RiskFactorSchema } from '@features/RiskFactor/types'

import type { RiskFactor } from '@features/RiskFactor/types'
import type { SafeParseReturnType } from 'zod'

function valueOrundefinedIfNotFoundOrThrow<Type>(
  result: SafeParseReturnType<any, any>,
  response: BackendApi.ResponseBodyError | Type
): Type | undefined {
  if (!result.success) {
    if ((response as BackendApi.ResponseBodyError).code === BackendApi.ErrorCode.NOT_FOUND_BUT_OK) {
      return undefined
    }

    throw result.error
  }

  return response as Type
}

export const riskFactorApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getRiskFactor: builder.query<RiskFactor | undefined, string>({
      providesTags: () => [{ type: 'RiskFactor' }],
      query: internalReferenceNumber => `/vessels/risk_factor?internalReferenceNumber=${internalReferenceNumber}`,
      transformResponse: (response: BackendApi.ResponseBodyError | RiskFactor) => {
        const result = RiskFactorSchema.safeParse(response)

        return valueOrundefinedIfNotFoundOrThrow<RiskFactor>(result, response)
      }
    })
  })
})
