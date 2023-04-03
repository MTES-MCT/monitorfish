import { filter, identity } from 'ramda'

import { MissionDateRangeFilter, MissionFilterType } from './constants'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS } from '../../../domain/entities/alerts/constants'
import { dayjs } from '../../../utils/dayjs'

import type { MissionFilter } from './types'
import type { SeaFront } from '../../../constants'
import type { Mission } from '../../../domain/entities/mission/types'
import type { DateRange } from '@mtes-mct/monitor-ui'

export const getSeaFrontFilter = (selectedSubMenu: string): MissionFilter => {
  const seaFrontGroup = ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSubMenu] as
    | {
        menuSeaFront: SeaFront
        seaFronts: string[]
      }
    | undefined

  return (missions: Mission.Mission[]) =>
    missions.filter(({ facade }) => (facade && seaFrontGroup ? seaFrontGroup.seaFronts.includes(facade) : true))
}

// TODO Add unit tests.
export const mapFilterFormRecordsToFilters = ([key, valueOrValues]: [MissionFilterType, any]): MissionFilter => {
  switch (key) {
    case MissionFilterType.CUSTOM_DATE_RANGE:
      return filter<Mission.Mission>(
        ({ endDateTimeUtc, startDateTimeUtc }) =>
          dayjs(endDateTimeUtc).isSameOrAfter((valueOrValues as DateRange)[0]) &&
          dayjs(startDateTimeUtc).isSameOrBefore((valueOrValues as DateRange)[1])
      )

    case MissionFilterType.DATE_RANGE:
      switch (valueOrValues as MissionDateRangeFilter) {
        case MissionDateRangeFilter.CURRENT_DAY:
          return filter<Mission.Mission>(({ endDateTimeUtc }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('day'))
          )

        case MissionDateRangeFilter.CURRENT_WEEK:
          return filter<Mission.Mission>(({ endDateTimeUtc }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('week'))
          )

        case MissionDateRangeFilter.CURRENT_MONTH:
          return filter<Mission.Mission>(({ endDateTimeUtc }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('month'))
          )

        case MissionDateRangeFilter.CURRENT_QUARTER:
          return filter<Mission.Mission>(({ endDateTimeUtc }) =>
            dayjs(endDateTimeUtc).isSameOrAfter(dayjs().startOf('quarter'))
          )

        // `case MissionDateRangeFilter.CUSTOM:`
        default:
          return identity
      }

    default:
      return typeof (valueOrValues as string | string[]) === 'string'
        ? filter<Mission.Mission>(mission => mission[key] === valueOrValues)
        : filter<Mission.Mission>(mission => valueOrValues.includes(mission[key]))
  }
}
