import { monitorenvApi } from './api'
import { ApiErrorCode, type BackendApiBooleanResponse } from './types'
import { FrontendApiError } from '../libs/FrontendApiError'
import { UsageError } from '../libs/UsageError'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

const ARCHIVE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu archiver ce moyen."
const CREATE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu créer ce moyen."
const CAN_DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu vérifier si ce moyen est supprimable."
const DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu supprimé ce moyen."
const GET_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE = "Nous n'avons pas pu récupérer ce moyen."
const GET_CONTROL_UNIT_RESOURCES_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des moyens."
const UPDATE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour ce moyen."

export const IMPOSSIBLE_CONTROL_UNIT_RESOURCE_DELETION_ERROR_MESSAGE =
  "Ce moyen est rattaché à des missions. Veuillez l'en détacher avant de le supprimer."

export const monitorenvControlUnitResourceApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    archiveControlUnitResource: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'ControlUnits' }, { type: 'Stations' }],
      query: controlUnitResourceId => ({
        method: 'PUT',
        url: `/v1/control_unit_resources/${controlUnitResourceId}/archive`
      }),
      transformErrorResponse: response => new FrontendApiError(ARCHIVE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE, response)
    }),

    canDeleteControlUnitResource: builder.query<boolean, number>({
      query: controlUnitResourceId => `/v1/control_unit_resources/${controlUnitResourceId}/can_delete`,
      transformErrorResponse: response =>
        new FrontendApiError(CAN_DELETE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE, response),
      transformResponse: (response: BackendApiBooleanResponse) => response.value
    }),

    createControlUnitResource: builder.mutation<undefined, ControlUnit.NewControlUnitResourceData>({
      invalidatesTags: () => [{ type: 'ControlUnits' }, { type: 'Stations' }],
      query: newControlUnitResourceData => ({
        body: newControlUnitResourceData,
        method: 'POST',
        url: `/v1/control_unit_resources`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_CONTROL_UNIT_RESOURCE_ERROR_MESSAGE, response)
    }),

    deleteControlUnitResource: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'ControlUnits' }, { type: 'Stations' }],
      query: controlUnitResourceId => ({
        method: 'DELETE',
        url: `/v1/control_unit_resources/${controlUnitResourceId}`
      }),
      transformErrorResponse: response => {
        if (response.responseData.type === ApiErrorCode.FOREIGN_KEY_CONSTRAINT) {
          return new UsageError(IMPOSSIBLE_CONTROL_UNIT_RESOURCE_DELETION_ERROR_MESSAGE)
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
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_CONTROL_UNIT_CONTACT_ERROR_MESSAGE, response)
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
