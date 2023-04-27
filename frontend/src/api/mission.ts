import { monitorenvApi, monitorfishApi } from '.'

import type { Mission, MissionWithActions } from '../domain/entities/mission/types'

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

    getMission: builder.query<Mission.Mission, Mission.Mission['id']>({
      query: id => `missions/${id}`
    }),

    updateMission: builder.mutation<void, Mission.Mission>({
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
          getMissionStatusFilter(filter.missionStatus),
          getMissionTypesFilter(filter.missionTypes),
          getSeaFrontsFilter(filter.seaFronts)
        ]
          .filter(v => v)
          .join('&')
    })
  })
})

export const { useCreateMissionMutation, useDeleteMissionMutation, useGetMissionQuery, useUpdateMissionMutation } =
  monitorenvMissionApi

export const { useGetMissionsQuery } = monitorfishMissionApi
