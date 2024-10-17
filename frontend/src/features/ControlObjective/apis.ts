import { FrontendApiError } from '@libs/FrontendApiError'
import { ascend, identity } from 'ramda'

import { monitorfishApi } from '../../api/api'

import type { ControlObjective, CreateControlObjectivePayload, UpdateControlObjective } from './types'

const UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour l'objectif de contrôle"
const DELETE_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu supprimer l'objectif de contrôle"
const ADD_CONTROL_OBJECTIVES_ERROR_MESSAGE = "Nous n'avons pas pu ajouter l'objectif de contrôle"
const ADD_CONTROL_OBJECTIVES_YEAR_ERROR_MESSAGE = "Nous n'avons pas pu ajouter une nouvelle année"

export const controlObjectiveApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    addControlObjective: builder.mutation<number, CreateControlObjectivePayload>({
      invalidatesTags: [{ type: 'ControlObjectives' }],
      query: createdFields => ({
        body: createdFields,
        method: 'POST',
        url: '/admin/control_objectives'
      }),
      transformErrorResponse: response => new FrontendApiError(ADD_CONTROL_OBJECTIVES_ERROR_MESSAGE, response)
    }),
    addControlObjectiveYear: builder.mutation<void, void>({
      invalidatesTags: [{ type: 'ControlObjectivesYears' }],
      query: () => ({
        method: 'POST',
        url: '/admin/control_objectives/years'
      }),
      transformErrorResponse: response => new FrontendApiError(ADD_CONTROL_OBJECTIVES_YEAR_ERROR_MESSAGE, response)
    }),
    deleteControlObjective: builder.mutation<void, number>({
      invalidatesTags: [{ type: 'ControlObjectives' }],
      query: id => ({
        method: 'DELETE',
        url: `/admin/control_objectives/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_CONTROL_OBJECTIVES_ERROR_MESSAGE, response)
    }),
    getControlObjectives: builder.query<ControlObjective[], number>({
      providesTags: () => [{ type: 'ControlObjectives' }],
      query: year => `/admin/control_objectives/${year}`
    }),
    getControlObjectiveYears: builder.query<number[], void>({
      providesTags: () => [{ type: 'ControlObjectivesYears' }],
      query: () => '/admin/control_objectives/years',
      transformResponse: (baseQueryReturnValue: number[]) => baseQueryReturnValue.sort(ascend(identity))
    }),
    updateControlObjective: builder.mutation<void, UpdateControlObjective>({
      invalidatesTags: [{ type: 'ControlObjectives' }],
      query: ({ id, updatedFields }) => ({
        body: updatedFields,
        method: 'PUT',
        url: `/admin/control_objectives/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_CONTROL_OBJECTIVES_ERROR_MESSAGE, response)
    })
  })
})

export const {
  useAddControlObjectiveMutation,
  useAddControlObjectiveYearMutation,
  useDeleteControlObjectiveMutation,
  useGetControlObjectivesQuery,
  useGetControlObjectiveYearsQuery,
  useUpdateControlObjectiveMutation
} = controlObjectiveApi
