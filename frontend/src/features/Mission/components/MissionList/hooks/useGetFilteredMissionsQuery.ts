import { completionStatusFilterFunction } from '@features/Mission/filters/completionStatusFilterFunction'
import { missionActionsFilterFunction } from '@features/Mission/filters/missionActionsFilterFunction'
import { Mission } from '@features/Mission/mission.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

import { SEA_FRONT_GROUP_SEA_FRONTS } from '../../../../../domain/entities/seaFront/constants'
import { administrationFilterFunction } from '../../../filters/administrationFilterFunction'
import { seaFrontFilterFunction } from '../../../filters/seaFrontFilterFunction'
import { unitFilterFunction } from '../../../filters/unitFilterFunction'
import { useGetMissionsQuery } from '../../../monitorfishMissionApi'
import { MissionDateRangeFilter, MissionFilterType } from '../types'

const TWO_MINUTES = 2 * 60 * 1000

export const useGetFilteredMissionsQuery = (): {
  isError: boolean
  isLoading: boolean
  missions: Mission.MissionWithActions[]
  missionsSeaFrontFiltered: Mission.MissionWithActions[]
} => {
  const listFilterValues = useMainAppSelector(state => state.missionList.listFilterValues)
  const listSeaFront = useMainAppSelector(state => state.missionList.listSeaFront)

  const filteredSeaFronts = useMemo(() => SEA_FRONT_GROUP_SEA_FRONTS[listSeaFront], [listSeaFront])

  const startedAfterDateTime = () => {
    const isCustom = listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE]?.length
    if (isCustom) {
      const date = listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE][0]

      /**
       * This date could either be:
       * - a string date when fetched from the localstorage
       * - a Date object when modified directly from the mission list (see `FormikDateRangePicker` component)
       */
      return typeof date === 'string' ? date : date.toISOString()
    }

    if (listFilterValues[MissionFilterType.DATE_RANGE]) {
      switch (listFilterValues[MissionFilterType.DATE_RANGE]) {
        case MissionDateRangeFilter.CURRENT_DAY:
          return customDayjs().utc().startOf('day').toISOString()

        case MissionDateRangeFilter.WEEK:
          return customDayjs().utc().startOf('day').subtract(7, 'day').toISOString()

        case MissionDateRangeFilter.MONTH:
          return customDayjs().utc().startOf('day').subtract(30, 'day').toISOString()

        default:
          return undefined
      }
    }

    return undefined
  }

  const startedBeforeDateTime = () => {
    const isCustom = listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE]?.length
    if (isCustom) {
      const date = listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE][1]

      /**
       * This date could either be:
       * - a string date when fetched from the localstorage
       * - a Date object when modified directly from the mission list (see `FormikDateRangePicker` component)
       */
      return typeof date === 'string' ? date : date.toISOString()
    }

    return undefined
  }

  const { data, isError, isFetching } = useGetMissionsQuery(
    {
      missionSource: listFilterValues[MissionFilterType.SOURCE],
      missionStatus: listFilterValues[MissionFilterType.STATUS],
      missionTypes: [listFilterValues[MissionFilterType.TYPE]],
      // seaFronts are filtered in memory
      seaFronts: [],
      startedAfterDateTime: startedAfterDateTime(),
      startedBeforeDateTime: startedBeforeDateTime()
    },
    { pollingInterval: TWO_MINUTES }
  )

  const missions: Mission.MissionWithActions[] = useMemo(() => {
    if (!data) {
      return []
    }

    const administrationFilter = listFilterValues[MissionFilterType.ADMINISTRATION] || []
    const unitFilter = listFilterValues[MissionFilterType.UNIT] || []
    const frontCompletionStatusFilter = listFilterValues[MissionFilterType.COMPLETION_STATUS] || []
    const withActionsFilter = listFilterValues[MissionFilterType.WITH_ACTIONS] || false

    return data.filter(
      mission =>
        administrationFilterFunction(mission, administrationFilter) &&
        unitFilterFunction(mission, unitFilter) &&
        completionStatusFilterFunction(mission, frontCompletionStatusFilter) &&
        missionActionsFilterFunction(mission, withActionsFilter)
    )
  }, [data, listFilterValues])

  const missionsSeaFrontFiltered: Mission.MissionWithActions[] = useMemo(() => {
    if (!missions) {
      return []
    }

    return missions.filter(mission => seaFrontFilterFunction(mission, filteredSeaFronts))
  }, [missions, filteredSeaFronts])

  return {
    isError,
    isLoading: isFetching,
    missions,
    missionsSeaFrontFiltered
  }
}
