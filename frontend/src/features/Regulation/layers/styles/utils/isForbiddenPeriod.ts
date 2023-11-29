import { isObject } from 'lodash'

import { getStartAndEndDatesSetWithCurrentYear } from '../../../../map/layers/styles/utils'
import { WEEKDAYS } from '../../../utils'

import type { DateInterval, FishingPeriod } from '../../../types'
import type { Dayjs } from 'dayjs'
import type Feature from 'ol/Feature'

export function isForbiddenPeriod(feature: Feature | undefined, currentDate: Dayjs) {
  const currentWeekDayDigit = currentDate.day()

  const fishingPeriodValue = feature?.get('fishing_period') || feature?.get('fishingPeriod')
  if (!fishingPeriodValue) {
    return false
  }

  const fishingPeriod = isObject(fishingPeriodValue)
    ? (fishingPeriodValue as FishingPeriod)
    : (JSON.parse(fishingPeriodValue) as FishingPeriod)

  switch (fishingPeriod.authorized) {
    /**
     * If the dates, weekdays and dateRanges are not set, the period won't be forbidden by default.
     *
     * If they are set, the period will be forbidden when
     *  - hasAllowedRange is false AND
     *  - hasAllowedDate is false AND
     *  - hasAllowedWeekDay is false
     */
    case true: {
      const isAlwaysAuthorized =
        removeNullValues(fishingPeriod.dates).length === 0 &&
        removeNullValues(fishingPeriod.weekdays).length === 0 &&
        removeNullValues(fishingPeriod.dateRanges).length === 0

      if (isAlwaysAuthorized) {
        return false
      }

      const hasAllowedRange = !!fishingPeriod.dateRanges?.find(dateRange => {
        if (fishingPeriod.annualRecurrence) {
          return isWithinDateRangeWithAnnualRecurrence(dateRange, currentDate)
        }

        return currentDate.isAfter(dateRange.startDate) && currentDate.isBefore(dateRange.endDate)
      })

      const hasAllowedDate = !!fishingPeriod.dates?.find(
        date =>
          currentDate.isSame(date, 'year') && currentDate.isSame(date, 'month') && currentDate.isSame(date, 'date')
      )

      const hasAllowedWeekDay = !!fishingPeriod.weekdays?.find(
        day => Object.keys(WEEKDAYS).indexOf(day) === currentWeekDayDigit
      )

      return !hasAllowedRange && !hasAllowedDate && !hasAllowedWeekDay
    }
    /**
     * It is forbidden when
     *  - isAlwaysForbidden is true OR
     *  - hasForbiddenRange is true OR
     *  - hasForbiddenDate is true OR
     *  - hasForbiddenWeekDay is true
     */
    case false: {
      const isAlwaysForbidden = fishingPeriod.always

      const hasForbiddenRange = !!fishingPeriod.dateRanges?.find(dateRange => {
        if (fishingPeriod.annualRecurrence) {
          return isWithinDateRangeWithAnnualRecurrence(dateRange, currentDate)
        }

        return currentDate.isAfter(dateRange.startDate) && currentDate.isBefore(dateRange.endDate)
      })

      const hasForbiddenDate = !!fishingPeriod.dates?.find(
        date =>
          currentDate.isSame(date, 'year') && currentDate.isSame(date, 'month') && currentDate.isSame(date, 'date')
      )

      const hasForbiddenWeekDay = !!fishingPeriod.weekdays?.find(
        day => Object.keys(WEEKDAYS).indexOf(day) === currentWeekDayDigit
      )

      return isAlwaysForbidden || hasForbiddenRange || hasForbiddenDate || hasForbiddenWeekDay
    }
    default: {
      return false
    }
  }
}

function isWithinDateRangeWithAnnualRecurrence(dateRange: DateInterval, currentDate: Dayjs): boolean {
  const { endDateWithOffsetApplied, startDateWithOffsetApplied } = getStartAndEndDatesSetWithCurrentYear(
    dateRange,
    currentDate
  )

  /*
    The date range looks like this :
    Months:   1    2    3    4    5    6    7    8    9    10    11    12
                    [startDate___________________________endDate]
   */
  if (endDateWithOffsetApplied?.isAfter(startDateWithOffsetApplied)) {
    return currentDate.isAfter(startDateWithOffsetApplied) && currentDate.isBefore(endDateWithOffsetApplied)
  }

  /*
    The date range looks like this :
    Months:   1    2    3    4    5    6    7    8    9    10    11    12
            ________endDate]                          [startDate__________
   */
  return currentDate.isAfter(startDateWithOffsetApplied) || currentDate.isBefore(endDateWithOffsetApplied)
}

function removeNullValues(array: any[]) {
  if (!array || !array.length) {
    return []
  }

  return array.filter(item => item)
}
