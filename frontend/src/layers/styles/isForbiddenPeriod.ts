import { WEEKDAYS } from '../../domain/entities/regulatory'
import { dayjs } from '../../utils/dayjs'

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
        // The annual recurrence is only permitted for an end date before the current date
        if (fishingPeriod.annualRecurrence && currentDate.isAfter(dateRange.endDate)) {
          const { endDateWithOffsetApplied, startDateWithOffsetApplied } = getStartAndEndDatesWithAppliedOffset(
            dateRange,
            currentDate
          )

          return currentDate.isBefore(startDateWithOffsetApplied) || currentDate.isAfter(endDateWithOffsetApplied)
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
        // The annual recurrence is only permitted for an end date before the current date
        if (fishingPeriod.annualRecurrence && currentDate.isAfter(dateRange.endDate)) {
          const { endDateWithOffsetApplied, startDateWithOffsetApplied } = getStartAndEndDatesWithAppliedOffset(
            dateRange,
            currentDate
          )

          return currentDate.isAfter(startDateWithOffsetApplied) && currentDate.isBefore(endDateWithOffsetApplied)
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

function getStartAndEndDatesWithAppliedOffset(dateRange: DateInterval, currentDate: Dayjs): Record<string, Dayjs> {
  const endDateWithCurrentYear = dayjs(dateRange.endDate)
  const startDateWithCurrentYear = dayjs(dateRange.startDate)
  const yearOffset = currentDate.year() - endDateWithCurrentYear.year()

  const endDateWithOffsetApplied = endDateWithCurrentYear.add(yearOffset, 'year')
  const startDateWithOffsetApplied = startDateWithCurrentYear.add(yearOffset, 'year')

  if (endDateWithOffsetApplied?.isBefore(currentDate) || startDateWithOffsetApplied?.isAfter(currentDate)) {
    return {
      endDateWithOffsetApplied: endDateWithOffsetApplied?.add(1, 'year'),
      startDateWithOffsetApplied: startDateWithOffsetApplied?.add(1, 'year')
    }
  }

  return {
    endDateWithOffsetApplied,
    startDateWithOffsetApplied
  }
}
