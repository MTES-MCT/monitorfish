import { monitorfishApi } from '.'

import type { MissionAction } from '../domain/types/missionAction'

export const missionActionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    createMissionAction: builder.mutation<void, MissionAction.MissionActionData>({
      invalidatesTags: () => [{ type: 'MissionActions' }],
      query: missionAction => ({
        body: missionAction,
        method: 'POST',
        url: `/mission_actions`
      })
    }),

    deleteMissionAction: builder.mutation<void, string>({
      invalidatesTags: () => [{ type: 'MissionActions' }],
      query: id => ({
        method: 'DELETE',
        url: `/mission_actions/${id}`
      })
    }),

    getMissionActions: builder.query<MissionAction.MissionAction[], number>({
      providesTags: () => [{ type: 'MissionActions' }],
      query: missionId => `/mission_actions?missionId=${missionId}`
    }),

    updateMissionAction: builder.mutation<void, MissionAction.MissionAction>({
      invalidatesTags: () => [{ type: 'MissionActions' }],
      query: missionAction => ({
        body: missionAction,
        method: 'PUT',
        url: `/mission_actions/${missionAction.id}`
      })
    })
  })
})

export const {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useGetMissionActionsQuery,
  useUpdateMissionActionMutation
} = missionActionApi
