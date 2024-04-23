import { FrontendApiError } from '@libs/FrontendApiError'

import { Mission } from './mission.types'
import { monitorfishApi } from '../../api/api'

const GET_MISSION_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la mission."

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
const getSeafrontsFilter = seafronts => seafronts?.length > 0 && `seaFronts=${encodeURIComponent(seafronts)}`

enum MonitorenvStatusMapping {
  CLOSED = 'CLOSED',
  DONE = 'ENDED',
  IN_PROGRESS = 'PENDING',
  UPCOMING = 'UPCOMING'
}

export const monitorfishMissionApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getMission: builder.query<Mission.MissionWithActions, Mission.Mission['id']>({
      keepUnusedDataFor: 0,
      query: id => `/missions/${id}`,
      transformErrorResponse: response => new FrontendApiError(GET_MISSION_ERROR_MESSAGE, response)
    }),

    getMissions: builder.query<Mission.MissionWithActions[], GetMissionsFilter | void>({
      providesTags: [{ type: 'Missions' }],
      query: (filter: GetMissionsFilter) =>
        [
          'missions?',
          getStartDateFilter(filter.startedAfterDateTime),
          getEndDateFilter(filter.startedBeforeDateTime),
          getMissionSourceFilter(filter.missionSource),
          getMissionStatusFilter(filter.missionStatus?.map(status => MonitorenvStatusMapping[status])),
          getMissionTypesFilter(filter.missionTypes),
          getSeafrontsFilter(filter.seaFronts)
        ]
          .filter(v => v)
          .join('&')
    })
  })
})

export const { useGetMissionQuery, useGetMissionsQuery } = monitorfishMissionApi
