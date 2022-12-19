import { filter, identity } from 'ramda'

import { dayjs } from '../../../utils/dayjs'
import { MissionDateRangeFilter, MissionFilterType } from './constants'

import type { Mission } from '../../../domain/types/mission'
import type { MissionFilter } from './types'
import type { DateRange } from '@mtes-mct/monitor-ui'

// TODO Add unit tests.
export const mapFilterFormRecordsToFilters = ([key, valueOrValues]: [MissionFilterType, any]): MissionFilter => {
  switch (key) {
    case MissionFilterType.CUSTOM_DATE_RANGE:
      return filter<Mission>(
        ({ endDate, startDate }) =>
          dayjs(startDate).isSameOrAfter((valueOrValues as DateRange)[0]) &&
          dayjs(endDate).isSameOrBefore((valueOrValues as DateRange)[1])
      )

    case MissionFilterType.DATE_RANGE:
      switch (valueOrValues as MissionDateRangeFilter) {
        case MissionDateRangeFilter.CURRENT_DAY:
          return filter<Mission>(({ startDate }) => dayjs(startDate).isSameOrAfter(dayjs().startOf('day')))

        case MissionDateRangeFilter.CURRENT_WEEK:
          return filter<Mission>(({ startDate }) => dayjs(startDate).isSameOrAfter(dayjs().startOf('week')))

        case MissionDateRangeFilter.CURRENT_MONTH:
          return filter<Mission>(({ startDate }) => dayjs(startDate).isSameOrAfter(dayjs().startOf('month')))

        case MissionDateRangeFilter.CURRENT_QUARTER:
          return filter<Mission>(({ startDate }) => dayjs(startDate).isSameOrAfter(dayjs().startOf('quarter')))

        // `case MissionDateRangeFilter.CUSTOM:`
        default:
          return identity
      }

    default:
      return typeof (valueOrValues as string | string[]) === 'string'
        ? filter<Mission>(mission => mission[key] === valueOrValues)
        : filter<Mission>(mission => valueOrValues.includes(mission[key]))
  }
}
