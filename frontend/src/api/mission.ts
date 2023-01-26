import ky from 'ky'

import { monitorenvApi } from '.'
import { ApiError } from '../libs/ApiError'

import type { Mission, MissionData } from '../domain/types/mission'
import type { MissionControlsSummary } from '../domain/types/missionAction'

export const missionApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    create: builder.mutation<void, MissionData>({
      invalidatesTags: () => [{ type: 'Missions' }],
      query: mission => ({
        body: mission,
        method: 'PUT',
        url: `missions`
      })
    }),

    delete: builder.mutation<void, string>({
      invalidatesTags: () => [{ type: 'Missions' }],
      query: id => ({
        method: 'DELETE',
        url: `missions/${id}`
      })
    }),

    getMany: builder.query<Mission[], void>({
      providesTags: () => [{ type: 'Missions' }],
      query: () => `missions?startedAfterDateTime=&startedBeforeDateTime=`
    }),

    update: builder.mutation<void, Mission>({
      invalidatesTags: () => [{ type: 'Missions' }],
      query: mission => ({
        body: mission,
        method: 'POST',
        url: `missions`
      })
    })
  })
})

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
      .get(`/bff/v1/mission_actions?vesselId=${vesselId}&afterDateTime=${fromDate.toISOString()}`)
      .json<MissionControlsSummary>()
  } catch (err) {
    throw new ApiError(MISSION_ACTIONS_ERROR_MESSAGE, err)
  }
}
