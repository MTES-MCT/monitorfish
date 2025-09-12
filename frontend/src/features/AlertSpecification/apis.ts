import { monitorfishApi } from '@api/api'
import { AlertSpecificationSchema } from '@features/AlertSpecification/schemas/AlertSpecificationSchema'
import { FrontendApiError } from '@libs/FrontendApiError'
import { parseResponseOrReturn } from '@utils/parseResponseOrReturn'

import type { AlertSpecification } from '@features/AlertSpecification/types'

const POSITION_ALERT_SPECIFICATION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les spécification d'alertes"

export const alertSpecificationsApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getAllAlertSpecifications: builder.query<AlertSpecification[], void>({
      providesTags: () => [{ type: 'AlertSpecifications' }],
      query: () => `/position_alerts_specs`,
      transformErrorResponse: response => new FrontendApiError(POSITION_ALERT_SPECIFICATION_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: AlertSpecification[]) =>
        parseResponseOrReturn<AlertSpecification>(baseQueryReturnValue, AlertSpecificationSchema, true)
    })
  })
})

export const { useGetAllAlertSpecificationsQuery } = alertSpecificationsApi
