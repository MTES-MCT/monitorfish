import { customDayjs } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

import { useGetMissionsQuery } from '../../../../api/mission'
import { MissionDateRangeFilter, MissionFilterType } from '../../../../features/SideWindow/MissionList/types'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { administrationFilterFunction } from '../filters/administrationFilterFunction'
import { unitFilterFunction } from '../filters/unitFilterFunction'

import type { MissionWithActions } from '../types'

const TWO_MINUTES = 2 * 60 * 1000

export const useGetFilteredMissionsQuery = (): {
  isError: boolean
  isLoading: boolean
  missions: MissionWithActions[]
} => {
  const { listFilterValues, listSeaFront } = useMainAppSelector(state => state.mission)

  const startedAfterDateTime = () => {
    const isCustom = listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE]?.length
    if (isCustom) {
      return listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE][0]
    }

    if (listFilterValues[MissionFilterType.DATE_RANGE]) {
      switch (listFilterValues[MissionFilterType.DATE_RANGE]) {
        case MissionDateRangeFilter.CURRENT_DAY:
          return customDayjs().utc().startOf('day')

        case MissionDateRangeFilter.CURRENT_WEEK:
          return customDayjs().utc().startOf('week')

        case MissionDateRangeFilter.CURRENT_MONTH:
          return customDayjs().utc().startOf('month')

        case MissionDateRangeFilter.CURRENT_QUARTER:
          return customDayjs().utc().startOf('quarter')

        case MissionDateRangeFilter.CURRENT_YEAR:
          return customDayjs().utc().startOf('year')

        default:
          return undefined
      }
    }

    return undefined
  }

  const startedBeforeDateTime = () => {
    const isCustom = listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE]?.length
    if (isCustom) {
      return listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE][1]
    }

    return undefined
  }

  const { data, isError, isLoading } = useGetMissionsQuery(
    {
      missionSource: listFilterValues[MissionFilterType.SOURCE],
      missionStatus: [listFilterValues[MissionFilterType.STATUS]],
      missionTypes: [listFilterValues[MissionFilterType.TYPE]],
      seaFronts: [listSeaFront],
      startedAfterDateTime: startedAfterDateTime(),
      startedBeforeDateTime: startedBeforeDateTime()
    },
    { pollingInterval: TWO_MINUTES }
  )

  const missions: MissionWithActions[] = useMemo(() => {
    if (!data) {
      return []
    }

    const administrationFilter = listFilterValues[MissionFilterType.ADMINISTRATION]
    const unitFilter = listFilterValues[MissionFilterType.UNIT]
    if (!administrationFilter?.length && !unitFilter?.length) {
      return data
    }

    return data.filter(
      mission => administrationFilterFunction(mission, administrationFilter) && unitFilterFunction(mission, unitFilter)
    )
  }, [data, listFilterValues])

  return {
    isError,
    isLoading,
    missions
  }
}
