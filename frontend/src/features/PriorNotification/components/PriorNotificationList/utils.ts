import { customDayjs, getMaybeBooleanFromRichBoolean, type DateAsStringRange, type Filter } from '@mtes-mct/monitor-ui'
import { SEA_FRONT_GROUP_SEA_FRONTS, SeaFrontGroup } from 'domain/entities/seaFront/constants'

import { ExpectedArrivalPeriod, LastControlPeriod } from './constants'

import type { ListFilter } from './types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export function countPriorNotificationsForSeaFrontGroup(
  priorNotifications: PriorNotification.PriorNotification[] | undefined,
  seaFrontGroup: SeaFrontGroup | 'EXTRA'
): number {
  if (!priorNotifications) {
    return 0
  }

  return priorNotifications.filter(({ seaFront }) => {
    if (seaFrontGroup === SeaFrontGroup.ALL) {
      return true
    }

    if (seaFrontGroup === 'EXTRA') {
      return !seaFront
    }

    return !!seaFront && !!SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup]
      ? SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup].includes(seaFront)
      : false
  }).length
}

function getApiFilterFromExpectedArrivalPeriod(
  period: ExpectedArrivalPeriod,
  customPeriod: DateAsStringRange | undefined
): LogbookMessage.ApiFilter {
  if (customPeriod) {
    return {
      willArriveAfter: customPeriod[0],
      willArriveBefore: customPeriod[1]
    }
  }

  switch (period) {
    case ExpectedArrivalPeriod.AFTER_TWO_HOURS_AGO:
      return {
        willArriveAfter: customDayjs().subtract(2, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.AFTER_FOUR_HOURS_AGO:
      return {
        willArriveAfter: customDayjs().subtract(4, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.AFTER_EIGTH_HOURS_AGO:
      return {
        willArriveAfter: customDayjs().subtract(8, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.AFTER_TWELVE_HOURS_AGO:
      return {
        willArriveAfter: customDayjs().subtract(12, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.AFTER_ONE_DAY_AGO:
      return {
        willArriveAfter: customDayjs().subtract(1, 'day').toISOString()
      }

    default:
      return {}
  }
}

function getApiFilterFromLastControlPeriod(period: LastControlPeriod | undefined): LogbookMessage.ApiFilter {
  switch (period) {
    case LastControlPeriod.AFTER_ONE_MONTH_AGO:
      return {
        lastControlledAfter: customDayjs().subtract(1, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_ONE_MONTH_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(1, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_THREE_MONTHS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(3, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_SIX_MONTHS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(6, 'month').toISOString()
      }

    case LastControlPeriod.BEFORE_ONE_YEAR_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(1, 'year').toISOString()
      }

    case LastControlPeriod.BEFORE_TWO_YEARS_AGO:
      return {
        lastControlledBefore: customDayjs().subtract(2, 'year').toISOString()
      }

    default:
      return {}
  }
}

export function getApiFilterFromListFilter(listFilter: ListFilter): LogbookMessage.ApiFilter {
  return {
    flagStates: listFilter.countryCodes,
    isLessThanTwelveMetersVessel: getMaybeBooleanFromRichBoolean(listFilter.isLessThanTwelveMetersVessel),
    portLocodes: listFilter.portLocodes,
    priorNotificationTypesAsOptions: listFilter.priorNotificationTypes,
    searchQuery: listFilter.searchQuery,
    specyCodes: listFilter.specyCodes,
    tripGearCodes: listFilter.gearCodes,
    tripSegmentSegments: listFilter.fleetSegmentSegments,
    ...getApiFilterFromExpectedArrivalPeriod(listFilter.expectedArrivalPeriod, listFilter.expectedArrivalCustomPeriod),
    ...getApiFilterFromLastControlPeriod(listFilter.lastControlPeriod)
  }
}

export function getLocalFilterFromListFilter(listFilter: ListFilter) {
  const filters: Filter<PriorNotification.PriorNotification>[] = []

  const hasOneOrMoreReportings = getMaybeBooleanFromRichBoolean(listFilter.hasOneOrMoreReportings)
  if (hasOneOrMoreReportings !== undefined) {
    const filter: Filter<PriorNotification.PriorNotification> = hasOneOrMoreReportings
      ? priorNotifications => priorNotifications.filter(priorNotification => priorNotification.reportingsCount > 0)
      : priorNotifications => priorNotifications.filter(priorNotification => priorNotification.reportingsCount === 0)

    filters.push(filter)
  }

  if (!!listFilter.seaFrontGroup && listFilter.seaFrontGroup !== SeaFrontGroup.ALL) {
    const filter: Filter<PriorNotification.PriorNotification> =
      listFilter.seaFrontGroup === 'EXTRA'
        ? priorNotifications => priorNotifications.filter(priorNotification => !priorNotification.seaFront)
        : priorNotifications =>
            priorNotifications.filter(priorNotification =>
              SEA_FRONT_GROUP_SEA_FRONTS[listFilter.seaFrontGroup].includes(priorNotification.seaFront)
            )

    filters.push(filter)
  }

  return filters
}
