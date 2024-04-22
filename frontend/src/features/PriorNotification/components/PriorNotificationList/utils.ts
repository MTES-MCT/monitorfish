import {
  SEA_FRONT_GROUP_SEA_FRONTS,
  SeaFrontGroup,
  type NoSeaFrontGroup,
  NO_SEA_FRONT_GROUP,
  ALL_SEA_FRONT_GROUP,
  type AllSeaFrontGroup
} from '@constants/seaFront'
import { customDayjs, getMaybeBooleanFromRichBoolean, type DateAsStringRange, type Filter } from '@mtes-mct/monitor-ui'

import { ExpectedArrivalPeriod, LastControlPeriod, SUB_MENU_LABEL } from './constants'

import type { ListFilter } from './types'
import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

export function countPriorNotificationsForSeaFrontGroup(
  priorNotifications: PriorNotification.PriorNotification[] | undefined,
  seaFrontGroup: SeaFrontGroup | AllSeaFrontGroup | NoSeaFrontGroup
): number {
  if (!priorNotifications) {
    return 0
  }

  return priorNotifications.filter(({ seaFront }) => {
    if (seaFrontGroup === ALL_SEA_FRONT_GROUP) {
      return true
    }

    if (seaFrontGroup === NO_SEA_FRONT_GROUP) {
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
    case ExpectedArrivalPeriod.IN_LESS_THAN_TWO_HOURS:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(2, 'hours').toISOString()
      }

    // Since this is the default period, we also use for the custom period when the date range input is not yet filled.
    case ExpectedArrivalPeriod.IN_LESS_THAN_FOUR_HOURS:
    case ExpectedArrivalPeriod.CUSTOM:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(4, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.IN_LESS_THAN_EIGTH_HOURS:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(8, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.IN_LESS_THAN_TWELVE_HOURS:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(12, 'hours').toISOString()
      }

    case ExpectedArrivalPeriod.IN_LESS_THAN_ONE_DAY:
      return {
        willArriveAfter: customDayjs.utc().toISOString(),
        willArriveBefore: customDayjs.utc().add(1, 'day').toISOString()
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
    priorNotificationTypes: listFilter.priorNotificationTypes,
    searchQuery: listFilter.searchQuery,
    specyCodes: listFilter.specyCodes,
    tripGearCodes: listFilter.gearCodes,
    tripSegmentCodes: listFilter.fleetSegmentSegments,
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

  if (!!listFilter.seaFrontGroup && listFilter.seaFrontGroup !== ALL_SEA_FRONT_GROUP) {
    const filter: Filter<PriorNotification.PriorNotification> =
      listFilter.seaFrontGroup === NO_SEA_FRONT_GROUP
        ? priorNotifications => priorNotifications.filter(priorNotification => !priorNotification.seaFront)
        : priorNotifications =>
            priorNotifications.filter(priorNotification =>
              SEA_FRONT_GROUP_SEA_FRONTS[listFilter.seaFrontGroup].includes(priorNotification.seaFront)
            )

    filters.push(filter)
  }

  return filters
}

export function getTitle(seaFrontGroup: SeaFrontGroup | AllSeaFrontGroup | NoSeaFrontGroup) {
  switch (seaFrontGroup) {
    case ALL_SEA_FRONT_GROUP:
      return 'Tous les préavis'

    case NO_SEA_FRONT_GROUP:
      return 'Préavis hors façade'

    default:
      return `Préavis en ${SUB_MENU_LABEL[seaFrontGroup]}`
  }
}
