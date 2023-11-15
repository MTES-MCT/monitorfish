import { logSoftError } from '@mtes-mct/monitor-ui'

import { MONITORENV_API_URL, monitorenvApi, monitorfishApi } from '../../../api'
import { Mission } from '../../../domain/entities/mission/types'
import { ApiError } from '../../../libs/ApiError'
import { ReconnectingEventSource } from '../../../libs/ReconnectingEventSource'

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
      async onCacheEntryAdded(id, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        const url = `${MONITORENV_API_URL}/api/v1/missions/${id}/sse`

        try {
          const eventSource = new ReconnectingEventSource(url)
          // eslint-disable-next-line no-console
          console.log(`SSE: listening for updates of mission id ${id}...`)

          // wait for the initial query to resolve before proceeding
          await cacheDataLoaded

          const listener = (event: MessageEvent) => {
            const mission = JSON.parse(event.data) as Mission.Mission
            // eslint-disable-next-line no-console
            console.log(`SSE: received an update for mission id ${mission.id}.`)

            updateCachedData(() => mission)
          }

          eventSource.addEventListener('MISSION_UPDATE', listener)

          // cacheEntryRemoved will resolve when the cache subscription is no longer active
          await cacheEntryRemoved

          // perform cleanup steps once the `cacheEntryRemoved` promise resolves
          eventSource.close()
        } catch (e) {
          logSoftError({
            context: {
              url
            },
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
