import { monitorenvApi, monitorfishApi } from '@api/api'
import { FrontendApiError } from '@libs/FrontendApiError'
import { ControlUnit } from '@mtes-mct/monitor-ui'
import { Mission } from 'domain/entities/mission/types'

const CREATE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu créer la mission."
const DELETE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu supprimé la mission."
const GET_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la mission."
const GET_ENGAGED_CONTROL_UNITS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les unités en mission."
const UPDATE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour la mission."

export const monitorenvMissionApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    createMission: builder.mutation<Mission.Mission, Mission.MissionData>({
      // TODO To remove when FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED feature flag is ON
      // As all mission will be fetched when closing the mission form
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
      // TODO To remove when FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED feature flag is ON
      // As all mission will be fetched when closing the mission form
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
      keepUnusedDataFor: 0,
      query: id => `/v1/missions/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_MISSION_ERROR_MESSAGE, response)
    }),

    updateMission: builder.mutation<Mission.Mission, Mission.Mission>({
      // TODO To remove when FRONTEND_MISSION_FORM_AUTO_SAVE_ENABLED feature flag is ON
      // As all mission will be fetched when closing the mission form
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
