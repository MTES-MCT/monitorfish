import { monitorfishApi } from '.'

import type { MissionAction } from '../domain/types/missionAction'

export const missionActionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    createMissionAction: builder.mutation<void, MissionAction.MissionActionData>({
      query: missionAction => ({
        body: missionAction,
        method: 'POST',
        url: `/mission_actions`
      })
    }),

    getMissionActions: builder.query<MissionAction.MissionAction[], number>({
      query: missionId => `/mission_actions?missionId=${missionId}`
    }),

    updateMissionAction: builder.mutation<void, MissionAction.MissionAction>({
      query: missionAction => ({
        body: missionAction,
        method: 'PUT',
        url: `/mission_actions/${missionAction.id}`
      })
    })
  })
})

export const { useCreateMissionActionMutation, useGetMissionActionsQuery, useUpdateMissionActionMutation } =
  missionActionApi
