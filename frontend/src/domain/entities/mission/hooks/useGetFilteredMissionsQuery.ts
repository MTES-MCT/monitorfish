import { customDayjs } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'

import { useGetMissionsQuery } from '../../../../api/mission'
import { SEA_FRONT_GROUP_SEA_FRONTS, SeaFrontLabel } from '../../../../constants'
import { MissionDateRangeFilter, MissionFilterType } from '../../../../features/SideWindow/MissionList/types'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { administrationFilterFunction } from '../filters/administrationFilterFunction'
import { seaFrontFilterFunction } from '../filters/seaFrontFilterFunction'
import { unitFilterFunction } from '../filters/unitFilterFunction'

import type { MissionWithActions } from '../types'

const TWO_MINUTES = 2 * 60 * 1000

export const useGetFilteredMissionsQuery = (): {
  isError: boolean
  isLoading: boolean
  missions: MissionWithActions[]
  missionsSeaFrontFiltered: MissionWithActions[]
} => {
  const { listFilterValues, listSeaFront } = useMainAppSelector(state => state.mission)

  const filteredSeaFronts = useMemo(
    () => SEA_FRONT_GROUP_SEA_FRONTS[listSeaFront].map(seaFront => SeaFrontLabel[seaFront]),
    [listSeaFront]
  )

  const startedAfterDateTime = () => {
    const isCustom = listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE]?.length
    if (isCustom) {
      return listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE][0].toISOString()
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
      return listFilterValues[MissionFilterType.CUSTOM_DATE_RANGE][1].toISOString()
    }

    return undefined
  }

  const { data, isError, isLoading } = useGetMissionsQuery(
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
    isLoading,
    missions,
    missionsSeaFrontFiltered
  }
}
