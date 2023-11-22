import { monitorenvApi } from '.'
import { ARCHIVE_GENERIC_ERROR_MESSAGE } from './constants'
import { ApiErrorCode, type BackendApiBooleanResponse } from './types'
import { FrontendApiError } from '../libs/FrontendApiError'
import { newUsageError } from '../libs/UsageError'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

export const ARCHIVE_CONTROL_UNITE_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu archiver ce moyen."
const CAN_DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu vérifier si ce moyen est supprimable."
export const DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE =
  "Ce moyen est rattaché à des missions. Veuillez l'en détacher avant de le supprimer."
const GET_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu récupérer ce moyen."
const GET_CONTROL_UNIT_RESOURCES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des moyens."

export const monitorenvControlUnitResourceApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    archiveControlUnitResource: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'ControlUnits' }, { type: 'Stations' }],
      query: controlUnitResourceId => ({
        method: 'PUT',
        url: `/v1/control_unit_resources/${controlUnitResourceId}/archive`
      }),
      transformErrorResponse: response => {
        if (response.data.type === ApiErrorCode.UNARCHIVED_CHILD) {
          return newUsageError(ARCHIVE_CONTROL_UNITE_RESOURCE_ERROR_MESSAGE)
        }

        return new FrontendApiError(ARCHIVE_GENERIC_ERROR_MESSAGE, response)
      }
    }),

    canDeleteControlUnitResource: builder.query<boolean, number>({
      query: controlUnitResourceId => `/v1/control_unit_resources/${controlUnitResourceId}/can_delete`,
      transformErrorResponse: response =>
        new FrontendApiError(CAN_DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE, response),
      transformResponse: (response: BackendApiBooleanResponse) => response.value
    }),

    createControlUnitResource: builder.mutation<void, ControlUnit.NewControlUnitResourceData>({
      invalidatesTags: () => [{ type: 'ControlUnits' }, { type: 'Stations' }],
      query: newControlUnitResourceData => ({
        body: newControlUnitResourceData,
        method: 'POST',
        url: `/v1/control_unit_resources`
      })
    }),

    deleteControlUnitResource: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'ControlUnits' }, { type: 'Stations' }],
      query: controlUnitResourceId => ({
        method: 'DELETE',
        url: `/v1/control_unit_resources/${controlUnitResourceId}`
      }),
      transformErrorResponse: response => {
        if (response.data.type === ApiErrorCode.FOREIGN_KEY_CONSTRAINT) {
          return newUsageError(DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE)
        }

        return new FrontendApiError(DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE, response)
      }
    }),

    getControlUnitResource: builder.query<ControlUnit.ControlUnitResource, number>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: controlUnitResourceId => `/v1/control_unit_resources/${controlUnitResourceId}`,
      transformErrorResponse: response => new FrontendApiError(GET_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE, response)
    }),

    getControlUnitResources: builder.query<ControlUnit.ControlUnitResource[], void>({
      providesTags: () => [{ type: 'ControlUnits' }],
      query: () => `/v1/control_unit_resources`,
      transformErrorResponse: response => new FrontendApiError(GET_CONTROL_UNIT_RESOURCES_ERROR_MESSAGE, response)
    }),

    updateControlUnitResource: builder.mutation<void, ControlUnit.ControlUnitResourceData>({
      invalidatesTags: () => [{ type: 'ControlUnits' }, { type: 'Stations' }],
      query: nextControlUnitResourceData => ({
        body: nextControlUnitResourceData,
        method: 'PUT',
        url: `/v1/control_unit_resources/${nextControlUnitResourceData.id}`
      })
    })
  })
})

export const {
  useArchiveControlUnitResourceMutation,
  useCanDeleteControlUnitResourceQuery,
  useCreateControlUnitResourceMutation,
  useDeleteControlUnitResourceMutation,
  useGetControlUnitResourceQuery,
  useGetControlUnitResourcesQuery,
  useUpdateControlUnitResourceMutation
} = monitorenvControlUnitResourceApi
