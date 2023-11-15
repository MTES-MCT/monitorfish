import {logSoftError} from '@mtes-mct/monitor-ui'

import {MONITORENV_API_URL, monitorenvApi, monitorfishApi} from '../../../api'
import {Mission} from '../../../domain/entities/mission/types'
import {ReconnectingEventSource} from '../../../libs/ReconnectingEventSource'

import type {ControlUnit} from '../../../domain/types/ControlUnit'
import {FrontendApiError} from "../../../libs/FrontendApiError";

const CREATE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu créer la mission."
const DELETE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu supprimé la mission."
const GET_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la mission."
const GET_ENGAGED_CONTROL_UNITS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les unités en mission."
const UPDATE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour la mission."

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
        url: `/v1/missions`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_MISSION_ERROR_MESSAGE, response)
    }),

    deleteMission: builder.mutation<void, Mission.Mission['id']>({
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled

        dispatch(monitorfishApi.util.invalidateTags([{ type: 'Missions' }]))
      },
      query: id => ({
        method: 'DELETE',
        url: `/v1/missions/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_MISSION_ERROR_MESSAGE, response)
    }),

    getEngagedControlUnits: builder.query<ControlUnit.EngagedControlUnits, void>({
      query: () => `/v1/missions/engaged_control_units`,
      transformErrorResponse: response => new FrontendApiError(GET_ENGAGED_CONTROL_UNITS_ERROR_MESSAGE, response)
    }),

    getMission: builder.query<Mission.Mission, Mission.Mission['id']>({
      providesTags: [{ type: 'Missions' }],
      query: id => `/v1/missions/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_MISSION_ERROR_MESSAGE, response),
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
    }),

    updateMission: builder.mutation<void, Mission.Mission>({
      invalidatesTags: [{ type: 'Missions' }],
      query: mission => ({
        body: mission,
        method: 'POST',
        url: `/v1/missions/${mission.id}`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_MISSION_ERROR_MESSAGE, response)
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
