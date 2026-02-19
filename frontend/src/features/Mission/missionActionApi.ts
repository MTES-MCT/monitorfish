import { monitorfishApi } from '@api/api'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { MissionAction } from '@features/Mission/missionAction.types'

export const MISSION_ACTIONS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les contrôles de ce navire"
export const MISSION_ACTIONS_EEZ_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la ZEE de la position"

export const missionActionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    createMissionAction: builder.mutation<MissionAction.MissionAction, MissionAction.MissionActionData>({
      query: missionAction => ({
        body: missionAction,
        method: 'POST',
        url: `/mission_actions`
      })
    }),

    deleteMissionAction: builder.mutation<void, number>({
      query: missionActionId => ({
        method: 'DELETE',
        url: `/mission_actions/${missionActionId}`
      })
    }),

    getIsInFrenchEez: builder.query<boolean, { latitude: number; longitude: number }>({
      query: ({ latitude, longitude }) => ({
        method: 'GET',
        params: {
          latitude,
          longitude
        },
        url: '/mission_actions/is-in-french-eez'
      }),
      transformErrorResponse: response => new FrontendApiError(MISSION_ACTIONS_EEZ_ERROR_MESSAGE, response)
    }),

    getVesselControls: builder.query<MissionAction.MissionControlsSummary, { fromDate: string; vesselId: number }>({
      query: ({ fromDate, vesselId }) => ({
        method: 'GET',
        params: {
          afterDateTime: fromDate,
          vesselId
        },
        url: '/mission_actions/controls'
      }),
      transformErrorResponse: response => new FrontendApiError(MISSION_ACTIONS_ERROR_MESSAGE, response)
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

export const {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useGetIsInFrenchEezQuery,
  useUpdateMissionActionMutation
} = missionActionApi
