import { monitorenvApi } from '.'
import { FrontendApiError } from '../libs/FrontendApiError'

import type { Administration } from '@mtes-mct/monitor-ui'

export const ARCHIVE_ADMINISTRATION_ERROR_MESSAGE = [
  'Certaines unités de cette administration ne sont pas archivées.',
  'Veuillez les archiver pour pouvoir archiver cette administration.'
].join(' ')
export const DELETE_ADMINISTRATION_ERROR_MESSAGE = [
  'Des unités sont encore rattachées à cette administration.',
  'Veuillez les supprimer avant de pouvoir supprimer cette administration.'
].join(' ')
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
