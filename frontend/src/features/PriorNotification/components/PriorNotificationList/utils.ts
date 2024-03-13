import { customDayjs } from '@mtes-mct/monitor-ui'

import { ReceivedAtPeriod } from './constants'

import type { ListFilter } from './types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

function getDateRangeFromReceivedAtPeriod(period: ReceivedAtPeriod | undefined) {
  if (!period) {
    return {
      integratedAfter: undefined,
      integratedBefore: undefined
    }
  }

  switch (period) {
    case ReceivedAtPeriod.AFTER_TWO_HOURS_AGO:
      return {
        integratedAfter: customDayjs().subtract(2, 'hours').toISOString(),
        integratedBefore: undefined
      }

    case ReceivedAtPeriod.AFTER_FOUR_HOURS_AGO:
      return {
        integratedAfter: customDayjs().subtract(4, 'hours').toISOString(),
        integratedBefore: undefined
      }

    case ReceivedAtPeriod.AFTER_EIGTH_HOURS_AGO:
      return {
        integratedAfter: customDayjs().subtract(8, 'hours').toISOString(),
        integratedBefore: undefined
      }

    case ReceivedAtPeriod.AFTER_TWELVE_HOURS_AGO:
      return {
        integratedAfter: customDayjs().subtract(12, 'hours').toISOString(),
        integratedBefore: undefined
      }

    case ReceivedAtPeriod.AFTER_ONE_DAY_AGO:
      return {
        integratedAfter: customDayjs().subtract(1, 'day').toISOString(),
        integratedBefore: undefined
      }

    default:
      return {
        integratedAfter: undefined,
        integratedBefore: undefined
      }
  }
}

export function getApiFilterFromListFilter(listFilterValues: ListFilter): LogbookMessage.ApiFilter {
  const { integratedAfter, integratedBefore } = listFilterValues.receivedAtCustomDateRange
    ? {
        integratedAfter: listFilterValues.receivedAtCustomDateRange[0],
        integratedBefore: listFilterValues.receivedAtCustomDateRange[1]
      }
    : getDateRangeFromReceivedAtPeriod(listFilterValues.receivedAtPeriod)

  return {
    flagStates: listFilterValues.countryCodes,
    integratedAfter,
    integratedBefore,
    portLocodes: listFilterValues.portLocodes,
    searchQuery: listFilterValues.searchQuery,
    specyCodes: listFilterValues.specyCodes,
    tripGearCodes: listFilterValues.gearCodes,
    tripSegmentSegments: listFilterValues.fleetSegmentSegments,
    vesselId: undefined
  }
}
