import { describe, expect, it } from '@jest/globals'
import Feature from 'ol/Feature'

import { WEEKDAYS } from '../../domain/entities/regulatory'
import { getUtcDayjs } from '../../utils/getUtcDayjs'
import { isForbiddenPeriod } from './isForbiddenPeriod'

describe('isForbiddenPeriod', () => {
  it('isForbiddenPeriod Should return false When the regulation date range is out of a not authorized range', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [{ endDate: '2022-06-15T12:52:33.708Z', startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation date range is within a not authorized range', async () => {
    // Given
    const dateInTheFuture = getDateInTheFuture()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [{ endDate: `${dateInTheFuture}T12:52:33.708Z`, startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When the regulation date range is within an authorized range', async () => {
    // Given
    const dateInTheFuture = getDateInTheFuture()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [{ endDate: `${dateInTheFuture}T12:52:33.708Z`, startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation date range is out of an authorized range', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [{ endDate: `2022-04-05T12:52:33.708Z`, startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(true)
  })

  it('isForbiddenPeriod Should return true When the regulation unauthorized dates equals the current date', async () => {
    // Given
    const now = getUtcDayjs().toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [],
        dates: [now],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When the regulation unauthorized dates do not equals the current date', async () => {
    // Given
    const nowPlusOneDay = getUtcDayjs().add(1, 'day').toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [],
        dates: [nowPlusOneDay],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(false)
  })

  it('isForbiddenPeriod Should return false When the regulation unauthorized dates equals the current date', async () => {
    // Given
    const now = getUtcDayjs().toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [],
        dates: [now],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation unauthorized dates do not equals the current date', async () => {
    // Given
    const nowPlusOneDay = getUtcDayjs().add(1, 'day').toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [],
        dates: [nowPlusOneDay],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(true)
  })

  it('isForbiddenPeriod Should return true When the regulation unauthorized week days equals the current week day', async () => {
    // Given
    const currentWeekDay = getUtcDayjs().day()
    const weekDay = Object.keys(WEEKDAYS).find((_, index) => index === currentWeekDay)
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: [weekDay]
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When the regulation unauthorized week days do not equals the current week day', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(false)
  })

  it('isForbiddenPeriod Should return false When the regulation authorized week days equals the current week day', async () => {
    // Given
    const currentWeekDay = getUtcDayjs().day()
    const weekDay = Object.keys(WEEKDAYS).find((_, index) => index === currentWeekDay)
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: [weekDay]
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation authorized week days do not equals the current week day', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation is always forbidden', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        always: true,
        authorized: false,
        dateRanges: [],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    expect(isForbiddenPeriod(feature)).toEqual(true)
  })
})

function getDateInTheFuture() {
  const MAX_MONTH_IN_YEAR = 12
  const now = getUtcDayjs()
  const currentMonth = now.month() + 1

  if (currentMonth === MAX_MONTH_IN_YEAR) {
    const date = now.add(1, 'year')

    return date.format('YYYY-MM-DD')
  }

  const date = now.add(1, 'month')

  return date.format('YYYY-MM-DD')
}
