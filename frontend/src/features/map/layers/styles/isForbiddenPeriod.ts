import { getStartAndEndDatesSetWithCurrentYear } from './utils'
import { WEEKDAYS } from '../../../../domain/entities/regulation'

import type { DateInterval, FishingPeriod } from '../../../../domain/types/regulation'
import type { Dayjs } from 'dayjs'
import type Feature from 'ol/Feature'

export function isForbiddenPeriod(feature: Feature | undefined, currentDate: Dayjs) {
  const currentWeekDayDigit = currentDate.day()

  const fishingPeriodString = feature?.get('fishing_period')
  if (!fishingPeriodString) {
    return false
  }

  const fishingPeriod = JSON.parse(fishingPeriodString) as FishingPeriod
  switch (fishingPeriod.authorized) {
    /**
     * It is forbidden when
     *  - isAlwaysAuthorized is false AND
     *  - hasAllowedRange is false AND
     *  - hasAllowedDate is false AND
     *  - hasAllowedWeekDay is false
     */
    case true: {
      const isAlwaysAuthorized = fishingPeriod.always

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

      return !isAlwaysAuthorized && !hasAllowedRange && !hasAllowedDate && !hasAllowedWeekDay
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
