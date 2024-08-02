import {
  SeafrontGroup,
  type NoSeafrontGroup,
  NO_SEAFRONT_GROUP,
  ALL_SEAFRONT_GROUP,
  type AllSeafrontGroup
} from '@constants/seafront'
import { LogbookMessage } from '@features/Logbook/LogbookMessage.types'
import { THEME, customDayjs, getMaybeBooleanFromRichBoolean, type DateAsStringRange } from '@mtes-mct/monitor-ui'

import {
  COMMUNITY_PRIOR_NOTIFICATION_TYPES,
  DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX,
  ExpectedArrivalPeriod,
  LastControlPeriod,
  SUB_MENU_LABEL
} from './constants'
import { PriorNotification } from '../../PriorNotification.types'

import type { ListFilter } from './types'
import type { CSSProperties } from 'react'

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

export function getColorsFromState(state: PriorNotification.State | undefined): {
  backgroundColor: string
  borderColor: string
  color: string
} {
  // [backgroundColor, borderColor, color]
  let colors: [string, string, string]

  switch (state) {
    case PriorNotification.State.FAILED_SEND:
      colors = [THEME.color.maximumRed15, THEME.color.maximumRed15, THEME.color.maximumRed]
      break

    case PriorNotification.State.PENDING_VERIFICATION:
      colors = [THEME.color.goldenPoppyBorder, THEME.color.goldenPoppyBorder, THEME.color.charcoal]
      break

    case PriorNotification.State.AUTO_SEND_REQUESTED:
    case PriorNotification.State.AUTO_SEND_DONE:
      colors = [THEME.color.lightGray, THEME.color.lightGray, THEME.color.charcoal]
      break

    case PriorNotification.State.PENDING_AUTO_SEND:
    case PriorNotification.State.PENDING_SEND:
      colors = [THEME.color.gainsboro, THEME.color.slateGray, THEME.color.slateGray]
      break

    case PriorNotification.State.VERIFIED_AND_SENT:
      colors = [THEME.color.mediumSeaGreen25, THEME.color.mediumSeaGreen25, THEME.color.mediumSeaGreen]
      break

    case PriorNotification.State.OUT_OF_VERIFICATION_SCOPE:
    default:
      colors = [THEME.color.white, THEME.color.charcoal, THEME.color.charcoal]
      break
  }

  return {
    backgroundColor: colors[0],
    borderColor: colors[1],
    color: colors[2]
  }
}

export function getExpandableRowCellCustomStyle(columnId: string): CSSProperties {
  switch (columnId) {
    case LogbookMessage.ApiSortColumn.VESSEL_RISK_FACTOR:
    case 'actions':
      return { verticalAlign: 'bottom' }

    case 'state':
      return { padding: '7px 14px', verticalAlign: 'bottom' }

    default:
      return {}
  }
}

export function getStaticApiFilterFromListFilter(listFilter: ListFilter): LogbookMessage.ApiFilter {
  return {
    flagStates: listFilter.countryCodes,
    hasOneOrMoreReportings: getMaybeBooleanFromRichBoolean(listFilter.hasOneOrMoreReportings),
    isLessThanTwelveMetersVessel: getMaybeBooleanFromRichBoolean(listFilter.isLessThanTwelveMetersVessel),
    portLocodes: listFilter.portLocodes,
    priorNotificationTypes: listFilter.priorNotificationTypes,
    seafrontGroup: listFilter.seafrontGroup,
    searchQuery: listFilter.searchQuery,
    specyCodes: listFilter.specyCodes,
    states: listFilter.states,
    tripGearCodes: listFilter.gearCodes,
    tripSegmentCodes: listFilter.fleetSegmentSegments,
    ...getApiFilterFromExpectedArrivalPeriod(listFilter.expectedArrivalPeriod, listFilter.expectedArrivalCustomPeriod),
    ...getApiFilterFromLastControlPeriod(listFilter.lastControlPeriod)
  }
}

export function sortPriorNotificationTypesByPriority(priorNotificationTypes: string[]) {
  const communityTypes: string[] = []
  const designatedPortsTypes: string[] = []

  priorNotificationTypes.forEach(type => {
    if (COMMUNITY_PRIOR_NOTIFICATION_TYPES.includes(type)) {
      communityTypes.push(type)
    }
    if (type.startsWith(DESIGNATED_PORTS_PRIOR_NOTIFICATION_TYPE_PREFIX)) {
      designatedPortsTypes.push(type)
    }
  })

  const otherTypes = priorNotificationTypes
    .filter(type => !communityTypes.includes(type) && !designatedPortsTypes.includes(type))
    .sort()

  return [...communityTypes.sort(), ...designatedPortsTypes.sort(), ...otherTypes]
}

export function getTitle(seafrontGroup: SeafrontGroup | AllSeafrontGroup | NoSeafrontGroup) {
  switch (seafrontGroup) {
    case ALL_SEAFRONT_GROUP:
      return 'Tous les préavis'

    case NO_SEAFRONT_GROUP:
      return 'Préavis hors façade'

    default:
      return `Préavis en ${SUB_MENU_LABEL[seafrontGroup]}`
  }
}
