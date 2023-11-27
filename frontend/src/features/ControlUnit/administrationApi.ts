import { monitorenvApi } from '../../api/api'
import { FrontendApiError } from '../../libs/FrontendApiError'

import type { Administration } from '@mtes-mct/monitor-ui'

const GET_ADMINISTRATION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer cette administration."
const GET_ADMINISTRATIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des administrations."

export const monitorenvAdministrationApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    getAdministration: builder.query<Administration.Administration, number>({
      providesTags: () => [{ type: 'Administrations' }],
      query: administrationId => `/v1/administrations/${administrationId}`,
      transformErrorResponse: response => new FrontendApiError(GET_ADMINISTRATION_ERROR_MESSAGE, response)
    }),

    getAdministrations: builder.query<Administration.Administration[], void>({
      providesTags: () => [{ type: 'Administrations' }],
      query: () => `/v1/administrations`,
      transformErrorResponse: response => new FrontendApiError(GET_ADMINISTRATIONS_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetAdministrationQuery, useGetAdministrationsQuery } = monitorenvAdministrationApi
