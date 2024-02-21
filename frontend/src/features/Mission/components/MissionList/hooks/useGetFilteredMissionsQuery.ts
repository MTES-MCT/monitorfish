import { customDayjs } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

import { administrationFilterFunction } from '../../../../../domain/entities/mission/filters/administrationFilterFunction'
import { seaFrontFilterFunction } from '../../../../../domain/entities/mission/filters/seaFrontFilterFunction'
import { unitFilterFunction } from '../../../../../domain/entities/mission/filters/unitFilterFunction'
import { SEA_FRONT_GROUP_SEA_FRONTS } from '../../../../../domain/entities/seaFront/constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { MissionDateRangeFilter, MissionFilterType } from '../../../../SideWindow/MissionList/types'
import { useGetMissionsQuery } from '../../../monitorfishMissionApi'

import type { MissionWithActions } from '../../../../../domain/entities/mission/types'

const TWO_MINUTES = 2 * 60 * 1000

export const useGetFilteredMissionsQuery = (): {
  isError: boolean
  isLoading: boolean
  missions: MissionWithActions[]
  missionsSeaFrontFiltered: MissionWithActions[]
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

  const missions: MissionWithActions[] = useMemo(() => {
    if (!data) {
      return []
    }

    const administrationFilter = listFilterValues[MissionFilterType.ADMINISTRATION] || []
    const unitFilter = listFilterValues[MissionFilterType.UNIT] || []

    return data.filter(
      mission => administrationFilterFunction(mission, administrationFilter) && unitFilterFunction(mission, unitFilter)
    )
  }, [data, listFilterValues])

  const missionsSeaFrontFiltered: MissionWithActions[] = useMemo(() => {
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
