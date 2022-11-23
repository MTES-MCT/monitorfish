import { WEEKDAYS } from '../../domain/entities/regulatory'
import { getStartAndEndDatesSetWithCurrentYear } from './utils'

import type { DateInterval, FishingPeriod } from '../../domain/types/regulation'
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
     * It is forbidden when the date is out of at least one fishing period.
     */
    case true: {
      const hasForbiddenRange = !!fishingPeriod.dateRanges?.find(dateRange => {
        if (fishingPeriod.annualRecurrence) {
          return isForbiddenWhenAnnualRecurrenceInAuthorizedPeriod(dateRange, currentDate)
        }

        return currentDate.isBefore(dateRange.startDate) || currentDate.isAfter(dateRange.endDate)
      })

      const hasForbiddenDate = !!fishingPeriod.dates?.find(
        date =>
          !currentDate.isSame(date, 'year') || !currentDate.isSame(date, 'month') || !currentDate.isSame(date, 'date')
      )

      const hasForbiddenWeekDay = !!fishingPeriod.weekdays?.find(
        day => Object.keys(WEEKDAYS).indexOf(day) !== currentWeekDayDigit
      )

      return hasForbiddenRange || hasForbiddenDate || hasForbiddenWeekDay
    }
    /**
     * It is forbidden when the date is within at least one fishing period.
     */
    case false: {
      const isAlwaysForbidden = fishingPeriod.always

      const hasForbiddenRange = fishingPeriod.dateRanges?.find(dateRange => {
        if (fishingPeriod.annualRecurrence) {
          return isForbiddenWhenAnnualRecurrenceInForbiddenPeriod(dateRange, currentDate)
        }

        return currentDate.isAfter(dateRange.startDate) && currentDate.isBefore(dateRange.endDate)
      })

      const hasForbiddenDate = fishingPeriod.dates?.find(
        date =>
          currentDate.isSame(date, 'year') && currentDate.isSame(date, 'month') && currentDate.isSame(date, 'date')
      )

      const hasForbiddenWeekDay = fishingPeriod.weekdays?.find(
        day => Object.keys(WEEKDAYS).indexOf(day) === currentWeekDayDigit
      )

      return !!(isAlwaysForbidden || hasForbiddenRange || hasForbiddenDate || hasForbiddenWeekDay)
    }
    default: {
      return false
    }
  }
}

function isForbiddenWhenAnnualRecurrenceInAuthorizedPeriod(dateRange: DateInterval, currentDate: Dayjs): boolean {
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
    return !(currentDate.isAfter(startDateWithOffsetApplied) && currentDate.isBefore(endDateWithOffsetApplied))
  }

  /*
    The date range looks like this :
    Months:   1    2    3    4    5    6    7    8    9    10    11    12
            ________endDate]                          [startDate__________
   */
  return !(currentDate.isAfter(startDateWithOffsetApplied) || currentDate.isBefore(endDateWithOffsetApplied))
}

function isForbiddenWhenAnnualRecurrenceInForbiddenPeriod(dateRange: DateInterval, currentDate: Dayjs): boolean {
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
