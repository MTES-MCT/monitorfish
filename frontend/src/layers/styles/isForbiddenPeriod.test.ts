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
        annualRecurrence: false,
        authorized: false,
        dateRanges: [{ endDate: '2022-06-15T12:52:33.708Z', startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation date range is within a not authorized range', async () => {
    // Given
    const dateInTheFuture = getDateInTheFuture()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: false,
        dateRanges: [{ endDate: `${dateInTheFuture}T12:52:33.708Z`, startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When the regulation date range is within an authorized range', async () => {
    // Given
    const dateInTheFuture = getDateInTheFuture()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [{ endDate: `${dateInTheFuture}T12:52:33.708Z`, startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation date range is out of an authorized range', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [{ endDate: `2022-04-05T12:52:33.708Z`, startDate: '2022-04-01T12:51:24.623Z' }],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return true When the regulation unauthorized dates equals the current date', async () => {
    // Given
    const now = getUtcDayjs().toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: false,
        dateRanges: [],
        dates: [now],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When the regulation unauthorized dates do not equals the current date', async () => {
    // Given
    const nowPlusOneDay = getUtcDayjs().add(1, 'day').toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: false,
        dateRanges: [],
        dates: [nowPlusOneDay],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return false When the regulation unauthorized dates equals the current date', async () => {
    // Given
    const now = getUtcDayjs().toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [],
        dates: [now],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation unauthorized dates do not equals the current date', async () => {
    // Given
    const nowPlusOneDay = getUtcDayjs().add(1, 'day').toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [],
        dates: [nowPlusOneDay],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return true When the regulation unauthorized week days equals the current week day', async () => {
    // Given
    const currentWeekDay = getUtcDayjs().day()
    const weekDay = Object.keys(WEEKDAYS).find((_, index) => index === currentWeekDay)
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: false,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: [weekDay]
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When the regulation unauthorized week days do not equals the current week day', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: false,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return false When the regulation authorized week days equals the current week day', async () => {
    // Given
    const currentWeekDay = getUtcDayjs().day()
    const weekDay = Object.keys(WEEKDAYS).find((_, index) => index === currentWeekDay)
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: [weekDay]
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When the regulation authorized week days do not equals the current week day', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
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
    const currentDate = getUtcDayjs()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When it is authorized inside the date range with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [
          {
            endDate: '2022-04-19T09:24:56.025Z',
            startDate: '2021-09-15T09:24:35.588Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs().set('month', 11) // 11 (12 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When it is authorized outside the date range with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [
          {
            endDate: '2022-04-19T09:24:56.025Z',
            startDate: '2021-09-15T09:24:35.588Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs().set('month', 5) // 3 is outside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return true When it is not authorized inside the date range with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [
          {
            endDate: '2020-04-19T09:24:56.025Z',
            startDate: '2019-09-15T09:24:35.588Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs().set('month', 10) // 10 (11 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return true When it is not authorized inside the date range with another annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [
          {
            endDate: '2022-04-19T09:24:56.025Z',
            startDate: '2021-09-15T09:24:35.588Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs().set('month', 2) // 3 (4 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return false When it is not authorized outside another date range with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [
          {
            endDate: '2022-04-19T09:24:56.025Z',
            startDate: '2021-09-15T09:24:35.588Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs().set('month', 6) // 6 (7 from 1) is outside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('isForbiddenPeriod Should return true When it is not authorized inside another date range in the past with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [
          {
            endDate: '2005-04-19T09:24:56.025Z',
            startDate: '2004-09-15T09:24:35.588Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs().set('month', 9) // 9 (10 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('isForbiddenPeriod Should return true When it is not authorized outside another date range in the past with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: false,
        dateRanges: [
          {
            endDate: '2005-04-19T09:24:56.025Z',
            startDate: '2004-09-15T09:24:35.588Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = getUtcDayjs().set('month', 7) // 7 (8 from 1) is outside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
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
