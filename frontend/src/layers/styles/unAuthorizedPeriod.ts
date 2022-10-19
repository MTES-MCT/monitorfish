import { WEEKDAYS } from '../../domain/entities/regulatory'
import { getUtcDayjs } from '../../utils/getUtcDayjs'

import type { FishingPeriod } from '../../domain/types/regulation'
import type { Dayjs } from 'dayjs'
import type Feature from 'ol/Feature'

export function getIsUnauthorizedPeriod(feature: Feature | undefined) {
  const now = getUtcDayjs()
  const currentWeekDayDigit = now.day()

  const fishingPeriodString = feature?.get('fishing_period')
  if (!fishingPeriodString) {
    return false
  }

  const fishingPeriod = JSON.parse(fishingPeriodString) as FishingPeriod
  switch (fishingPeriod.authorized) {
    case true: {
      return getIsUnAuthorizedForAuthorizedPeriod(fishingPeriod, now, currentWeekDayDigit)
    }
    case false: {
      return getIsUnAuthorizedForUnAuthorizedPeriod(fishingPeriod, now, currentWeekDayDigit)
    }
    default: {
      return false
    }
  }
}

/**
 * It is unauthorized when the date is out of at least one fishing period.
 */
function getIsUnAuthorizedForAuthorizedPeriod(fishingPeriod: FishingPeriod, now: Dayjs, currentWeekDayDigit: number) {
  const hasUnAuthorizedRange = fishingPeriod.dateRanges?.find(
    dateRange => now.isBefore(dateRange.startDate) || now.isAfter(dateRange.endDate)
  )

  const hasUnAuthorizedDate = fishingPeriod.dates?.find(
    date => !now.isSame(date, 'year') || !now.isSame(date, 'month') || !now.isSame(date, 'date')
  )

  const hasUnAuthorizedWeekDay = fishingPeriod.weekdays?.find(
    day => Object.keys(WEEKDAYS).indexOf(day) !== currentWeekDayDigit
  )

  return !!(hasUnAuthorizedRange || hasUnAuthorizedDate || hasUnAuthorizedWeekDay)
}

/**
 * It is unauthorized when the date is within at least one fishing period.
 */
function getIsUnAuthorizedForUnAuthorizedPeriod(fishingPeriod: FishingPeriod, now: Dayjs, currentWeekDayDigit: number) {
  const hasUnAuthorizedRange = fishingPeriod.dateRanges?.find(
    dateRange => now.isAfter(dateRange.startDate) && now.isBefore(dateRange.endDate)
  )

  const hasUnAuthorizedDate = fishingPeriod.dates?.find(
    date => now.isSame(date, 'year') && now.isSame(date, 'month') && now.isSame(date, 'date')
  )

  const hasUnAuthorizedWeekDay = fishingPeriod.weekdays?.find(
    day => Object.keys(WEEKDAYS).indexOf(day) === currentWeekDayDigit
  )

  return !!(hasUnAuthorizedRange || hasUnAuthorizedDate || hasUnAuthorizedWeekDay)
}
