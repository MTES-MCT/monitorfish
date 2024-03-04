import { monitorenvApi } from '@api/api'
import { ApiErrorCode } from '@api/types'
import { FrontendApiError } from '@libs/FrontendApiError'
import { UsageError } from '@libs/UsageError'
import { ControlUnit } from '@mtes-mct/monitor-ui'
import { Mission } from 'domain/entities/mission/types'

const CREATE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu créer la mission."
const DELETE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu supprimer la mission."
const GET_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la mission."
const GET_ENGAGED_CONTROL_UNITS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les unités en mission."
const UPDATE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour la mission."
const CAN_DELETE_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu vérifier si cette mission est supprimable."
const IMPOSSIBLE_MISSION_DELETION_ERROR_MESSAGE =
  "Impossible de supprimer une mission avec des actions créées par d'autres centres."
type CanDeleteMissionResponseType = {
  canDelete: boolean
  sources: Mission.MissionSource[]
}

export const monitorenvMissionApi = monitorenvApi.injectEndpoints({
  endpoints: builder => ({
    canDeleteMission: builder.query<CanDeleteMissionResponseType, number>({
      query: id => `/v1/missions/${id}/can_delete?source=${Mission.MissionSource.MONITORFISH}`,
      transformErrorResponse: error => new FrontendApiError(CAN_DELETE_MISSION_ERROR_MESSAGE, error)
    }),
    createMission: builder.mutation<Mission.Mission, Mission.MissionData>({
      query: mission => ({
        body: mission,
        method: 'POST',
        url: `/v1/missions`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_MISSION_ERROR_MESSAGE, response)
    }),

    deleteMission: builder.mutation<void, Mission.Mission['id']>({
      query: id => ({
        method: 'DELETE',
        url: `/v2/missions/${id}?source=${Mission.MissionSource.MONITORFISH}`
      }),
      transformErrorResponse: response => {
        if (response.responseData.code === ApiErrorCode.EXISTING_MISSION_ACTION) {
          return new UsageError(IMPOSSIBLE_MISSION_DELETION_ERROR_MESSAGE)
        }

        return new FrontendApiError(DELETE_MISSION_ERROR_MESSAGE, response)
      }
    }),

    getEngagedControlUnits: builder.query<Array<ControlUnit.EngagedControlUnit>, void>({
      forceRefetch: () => true,
      query: () => `/v1/missions/engaged_control_units`,
      transformErrorResponse: response => new FrontendApiError(GET_ENGAGED_CONTROL_UNITS_ERROR_MESSAGE, response)
    }),

    getMission: builder.query<Mission.Mission, Mission.Mission['id']>({
      keepUnusedDataFor: 0,
      query: id => `/v1/missions/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_MISSION_ERROR_MESSAGE, response)
    }),

    updateMission: builder.mutation<Mission.Mission, Mission.Mission>({
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
