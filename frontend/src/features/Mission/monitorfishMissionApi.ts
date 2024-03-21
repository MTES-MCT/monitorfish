import { monitorfishApi } from '../../api/api'

import type { MissionWithActions } from './mission.types'

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
