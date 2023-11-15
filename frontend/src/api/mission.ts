import { monitorenvApi, monitorfishApi } from './api'
import { FrontendApiError } from '../libs/FrontendApiError'

import type { Mission, MissionWithActions } from '../domain/entities/mission/types'
import type { ControlUnit } from '@mtes-mct/monitor-ui'

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
import { monitorfishApi } from '.'

import type { MissionWithActions } from '../domain/entities/mission/types'
    getMission: builder.query<Mission.Mission, Mission.Mission['id']>({
      providesTags: [{ type: 'Missions' }],
      query: id => `/v1/missions/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_MISSION_ERROR_MESSAGE, response)
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

type GetMissionsFilter = {
  missionSource?: string
  missionStatus?: string[]
  missionTypes?: string[]
  seaFronts: string[]
  startedAfterDateTime?: string
  startedBeforeDateTime?: string
}

const getStartDateFilter = startedAfterDateTime =>
  startedAfterDateTime && `startedAfterDateTime=${encodeURIComponent(startedAfterDateTime)}`
const getEndDateFilter = startedBeforeDateTime =>
  startedBeforeDateTime && `startedBeforeDateTime=${encodeURIComponent(startedBeforeDateTime)}`
const getMissionSourceFilter = missionSource => missionSource && `missionSource=${encodeURIComponent(missionSource)}`
const getMissionStatusFilter = missionStatus =>
  missionStatus?.length > 0 && `missionStatus=${encodeURIComponent(missionStatus)}`
const getMissionTypesFilter = missionTypes =>
  missionTypes?.length > 0 && `missionTypes=${encodeURIComponent(missionTypes)}`
const getSeaFrontsFilter = seaFronts => seaFronts?.length > 0 && `seaFronts=${encodeURIComponent(seaFronts)}`

enum MonitorenvStatusMapping {
  CLOSED = 'CLOSED',
  DONE = 'ENDED',
  IN_PROGRESS = 'PENDING',
  UPCOMING = 'UPCOMING'
}

export const monitorfishMissionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getMissions: builder.query<MissionWithActions[], GetMissionsFilter | void>({
      providesTags: [{ type: 'Missions' }],
      query: (filter: GetMissionsFilter) =>
        [
          'missions?',
          getStartDateFilter(filter.startedAfterDateTime),
          getEndDateFilter(filter.startedBeforeDateTime),
          getMissionSourceFilter(filter.missionSource),
          getMissionStatusFilter(filter.missionStatus?.map(status => MonitorenvStatusMapping[status])),
          getMissionTypesFilter(filter.missionTypes),
          getSeaFrontsFilter(filter.seaFronts)
        ]
          .filter(v => v)
          .join('&')
    })
  })
})

export const { useGetMissionsQuery } = monitorfishMissionApi
