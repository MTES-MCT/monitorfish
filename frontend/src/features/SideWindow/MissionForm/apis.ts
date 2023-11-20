import { logSoftError } from '@mtes-mct/monitor-ui'

import { addNewMissionListener, missionEventListener, removeMissionListener } from './sse'
import { monitorenvApi, monitorfishApi } from '../../../api'
import { Mission } from '../../../domain/entities/mission/types'
import { ApiError } from '../../../libs/ApiError'

import type { ControlUnit } from '../../../domain/types/ControlUnit'

const GET_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la mission"
const GET_ENGAGED_CONTROL_UNITS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les unités en mission"

export const monitorenvMissionApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    createMission: builder.mutation<Pick<Mission.Mission, 'id'>, Mission.MissionData>({
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled

        dispatch(monitorfishApi.util.invalidateTags([{ type: 'Missions' }]))
      },
      query: mission => ({
        body: mission,
        method: 'POST',
        url: `/missions`
      })
    }),

    deleteMission: builder.mutation<void, Mission.Mission['id']>({
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled

        dispatch(monitorfishApi.util.invalidateTags([{ type: 'Missions' }]))
      },
      query: id => ({
        method: 'DELETE',
        url: `/missions/${id}`
      })
    }),

    getEngagedControlUnits: builder.query<ControlUnit.ControlUnit[], void>({
      query: () => `missions/engaged_control_units`,
      transformErrorResponse: response => new ApiError(GET_ENGAGED_CONTROL_UNITS_ERROR_MESSAGE, response)
    }),

    getMission: builder.query<Mission.Mission, Mission.Mission['id']>({
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(id, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded

          const listener = missionEventListener(id, updateCachedData)
          addNewMissionListener(id, listener)

          // cacheEntryRemoved will resolve when the cache subscription is no longer active
          await cacheEntryRemoved

          // perform cleanup once the `cacheEntryRemoved` promise resolves
          removeMissionListener(id)
        } catch (e) {
          logSoftError({
            isSideWindowError: true,
            message: "SSE: Can't connect or receive messages",
            originalError: e
          })
        }
      },
      providesTags: [{ type: 'Missions' }],
      query: id => `missions/${id}`,
      transformErrorResponse: response => new ApiError(GET_MISSION_ERROR_MESSAGE, response)
    }),

    updateMission: builder.mutation<void, Mission.Mission>({
      invalidatesTags: [{ type: 'Missions' }],
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
  useGetEngagedControlUnitsQuery,
  useGetMissionQuery,
  useUpdateMissionMutation
} = monitorenvMissionApi
