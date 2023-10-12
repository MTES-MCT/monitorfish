import { monitorenvApi, monitorfishApi } from '.'
import { ApiError } from '../libs/ApiError'

import type { Mission, MissionWithActions } from '../domain/entities/mission/types'
import type { ControlUnit } from '../domain/types/controlUnit'

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

export const {
  useCreateMissionMutation,
  useDeleteMissionMutation,
  useGetEngagedControlUnitsQuery,
  useGetMissionQuery,
  useUpdateMissionMutation
} = monitorenvMissionApi

export const { useGetMissionsQuery } = monitorfishMissionApi
