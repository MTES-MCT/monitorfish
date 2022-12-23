import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { getEnvironmentVariable } from './api'

import type { Mission, MissionType } from '../domain/types/mission'

const MONITORENV_URL = getEnvironmentVariable('REACT_APP_MONITORENV_URL')

export const missionApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${MONITORENV_URL}/api/v1/`
  }),
  endpoints: builder => ({
    create: builder.mutation<Mission, Partial<Mission>>({
      invalidatesTags: [{ id: 'LIST', type: 'Missions' }],
      query: mission => ({
        body: mission,
        method: 'PUT',
        url: `missions`
      })
    }),
    delete: builder.mutation({
      invalidatesTags: [{ id: 'LIST', type: 'Missions' }],
      query: ({ id }) => ({
        method: 'DELETE',
        url: `missions/${id}`
      })
    }),
    get: builder.query<MissionType, number>({
      query: id => `missions/${id}`
    }),
    getAll: builder.query<Mission[], undefined>({
      query: () => `missions?startedAfterDateTime=&startedBeforeDateTime=`
    }),
    update: builder.mutation<Mission, Mission>({
      invalidatesTags: [{ id: 'LIST', type: 'Missions' }],
      // onQueryStarted is useful for optimistic updates
      // The 2nd parameter is the destructured `MutationLifecycleApi`
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          missionApi.util.updateQueryData('get', id, draft => {
            Object.assign(draft, patch)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },

      query: ({ id, ...patch }) => ({
        body: { id, ...patch },
        method: 'PUT',
        url: `missions/${id}`
      })
    })
  }),
  reducerPath: 'missionApi',
  tagTypes: ['Missions']
})
