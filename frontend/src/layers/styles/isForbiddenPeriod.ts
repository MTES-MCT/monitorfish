import { WEEKDAYS } from '../../domain/entities/regulatory'
import { getUtcDayjs } from '../../utils/getUtcDayjs'

import type { FishingPeriod } from '../../domain/types/regulation'
import type Feature from 'ol/Feature'

export function isForbiddenPeriod(feature: Feature | undefined) {
  const currentDate = getUtcDayjs()
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
      const hasForbiddenRange = fishingPeriod.dateRanges?.find(
        dateRange => currentDate.isBefore(dateRange.startDate) || currentDate.isAfter(dateRange.endDate)
      )

      const hasForbiddenDate = fishingPeriod.dates?.find(
        date =>
          !currentDate.isSame(date, 'year') || !currentDate.isSame(date, 'month') || !currentDate.isSame(date, 'date')
      )

      const hasForbiddenWeekDay = fishingPeriod.weekdays?.find(
        day => Object.keys(WEEKDAYS).indexOf(day) !== currentWeekDayDigit
      )

      return !!(hasForbiddenRange || hasForbiddenDate || hasForbiddenWeekDay)
    }
    /**
     * It is forbidden when the date is within at least one fishing period.
     */
    case false: {
      const isAlwaysForbidden = fishingPeriod.always

      const hasForbiddenRange = fishingPeriod.dateRanges?.find(
        dateRange => currentDate.isAfter(dateRange.startDate) && currentDate.isBefore(dateRange.endDate)
      )

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
