import ky from 'ky'

import { monitorenvApi } from '.'
import { ApiError } from '../libs/ApiError'

import type { Mission } from '../domain/entities/mission/types'
import type { MissionAction } from '../domain/types/missionAction'

export const missionApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    createMission: builder.mutation<Pick<Mission.Mission, 'id'>, Mission.MissionData>({
      invalidatesTags: () => [{ type: 'Missions' }],
      query: mission => ({
        body: mission,
        method: 'PUT',
        url: `/missions`
      })
    }),

    deleteMission: builder.mutation<void, Mission.Mission['id']>({
      invalidatesTags: () => [{ type: 'Missions' }],
      query: id => ({
        method: 'DELETE',
        url: `/missions/${id}`
      })
    }),

    getMission: builder.query<Mission.Mission, Mission.Mission['id']>({
      providesTags: () => [{ type: 'Missions' }],
      query: id => `missions/${id}`
    }),

    getMissions: builder.query<Mission.Mission[], void>({
      providesTags: () => [{ type: 'Missions' }],
      query: () => `missions?startedAfterDateTime=&startedBeforeDateTime=`
    }),

    updateMission: builder.mutation<void, Mission.Mission>({
      invalidatesTags: () => [{ type: 'Missions' }],
      query: mission => ({
        body: mission,
        method: 'POST',
        url: `/missions/${mission.id}`
      })
    })
  })
})

export const {
  useCreateMissionMutation,
  useDeleteMissionMutation,
  useGetMissionQuery,
  useGetMissionsQuery,
  useUpdateMissionMutation
} = missionApi

// TODO Let's move that part somewhere else.

const MISSION_ACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récuperer les contrôles de ce navire"

/**
 * Get vessel controls
 *
 * @throws {@link ApiError}
 *
 */
export async function getVesselControlsFromAPI(vesselId: number, fromDate: Date) {
  try {
    return await ky
      .get(`/bff/v1/mission_actions/controls?vesselId=${vesselId}&afterDateTime=${fromDate.toISOString()}`)
      .json<MissionAction.MissionControlsSummary>()
  } catch (err) {
    throw new ApiError(MISSION_ACTIONS_ERROR_MESSAGE, err)
  }
}
