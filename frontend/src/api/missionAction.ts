import { monitorfishApi, monitorfishApiKy } from './api'
import { ApiError } from '../libs/ApiError'

import type { MissionAction } from '../domain/types/missionAction'

const GET_MISSION_ACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les actions de la mission"

export const missionActionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    createMissionAction: builder.mutation<void, MissionAction.MissionActionData>({
      invalidatesTags: () => [{ type: 'Missions' }, { type: 'MissionActions' }],
      query: missionAction => ({
        body: missionAction,
        method: 'POST',
        url: `/mission_actions`
      })
    }),

    deleteMissionAction: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: 'Missions' }, { type: 'MissionActions' }],
      query: missionActionId => ({
        method: 'DELETE',
        url: `/mission_actions/${missionActionId}`
      })
    }),

    getMissionActions: builder.query<MissionAction.MissionAction[], number>({
      providesTags: () => [{ type: 'MissionActions' }],
      query: missionId => `/mission_actions?missionId=${missionId}`,
      transformErrorResponse: response => new ApiError(GET_MISSION_ACTIONS_ERROR_MESSAGE, response)
    }),

    updateMissionAction: builder.mutation<void, MissionAction.MissionAction>({
      invalidatesTags: () => [{ type: 'Missions' }, { type: 'MissionActions' }],
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

export const MISSION_ACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les contrôles de ce navire"

/**
 * Get vessel controls
 *
 * @throws {@link ApiError}
 *
 */
export async function getVesselControlsFromAPI(vesselId: number, fromDate: Date) {
  try {
    return await monitorfishApiKy
      .get(`/bff/v1/mission_actions/controls?vesselId=${vesselId}&afterDateTime=${fromDate.toISOString()}`)
      .json<MissionAction.MissionControlsSummary>()
  } catch (err) {
    throw new ApiError(MISSION_ACTIONS_ERROR_MESSAGE, err)
  }
}
