import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'
import Feature from 'ol/Feature'

import { isForbiddenPeriod } from './isForbiddenPeriod'
import { WEEKDAYS } from '../../../utils'

describe('isForbiddenPeriod', () => {
  it('Should return false When the regulation date range is out of a not authorized range', async () => {
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When the regulation date range is within a not authorized range', async () => {
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When the regulation date range is within an authorized range', async () => {
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When the regulation date range is out of an authorized range', async () => {
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return true When the regulation unauthorized dates equals the current date', async () => {
    // Given
    const now = customDayjs().utc().toISOString()
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When the regulation unauthorized dates do not equals the current date', async () => {
    // Given
    const nowPlusOneDay = customDayjs().utc().add(1, 'day').toISOString()
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return false When the regulation unauthorized dates equals the current date', async () => {
    // Given
    const now = customDayjs().utc().toISOString()
    const nowPlusOneDay = customDayjs().utc().add(1, 'day').toISOString()
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [],
        dates: [now, nowPlusOneDay],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When the regulation authorized dates do not equals the current date', async () => {
    // Given
    const nowPlusOneDay = customDayjs().utc().add(1, 'day').toISOString()
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return true When the regulation unauthorized week days equals the current week day', async () => {
    // Given
    const currentWeekDay = customDayjs().utc().day()
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When the regulation unauthorized week days do not equals the current week day', async () => {
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return false When the regulation authorized week days equals the current week day', async () => {
    // Given
    const currentWeekDay = customDayjs().utc().day()
    const weekDay = Object.keys(WEEKDAYS).find((_, index) => index === currentWeekDay)
    const weekDayPlusOneDay = Object.keys(WEEKDAYS).find((_, index) => index === currentWeekDay + 1)
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Sur 11 semaines comprises dans cette période.',
        timeIntervals: [],
        weekdays: [weekDay, weekDayPlusOneDay]
      })
    })

    // When
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return false When the regulation authorized period is not specified', async () => {
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When the regulation is always forbidden', async () => {
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
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When the regulation is always authorized', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        always: true,
        authorized: true,
        dateRanges: [],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return false When it is authorized inside the date range with annual recurrence', async () => {
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
    const currentDate = customDayjs().utc().set('year', 2021).set('month', 11) // 11 (12 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When it is authorized outside the date range with annual recurrence', async () => {
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
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 5) // 5 (6 from 1) is outside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return true When it is not authorized inside the date range with annual recurrence', async () => {
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
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 10) // 10 (11 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return true When it is not authorized inside the date range with another annual recurrence', async () => {
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
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 2) // 3 (4 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When it is not authorized outside another date range with annual recurrence', async () => {
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
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 6) // 6 (7 from 1) is outside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When it is not authorized inside another date range in the past with annual recurrence', async () => {
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
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 9) // 9 (10 from 1) is inside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When it is not authorized outside another date range in the past with annual recurrence', async () => {
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
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 7) // 7 (8 from 1) is outside [09 -> 04]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When it is authorized outside another date range in the past with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [
          {
            endDate: '2022-11-15T10:26:37.477Z',
            startDate: '2021-09-15T09:25:52.233Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 10).set('date', 22) // 11 (12 from 1) is outside [09 -> 11]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When it is authorized inside another date range in the past with annual recurrence', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [
          {
            endDate: '2022-03-15T10:26:37.477Z',
            startDate: '2022-09-15T09:25:52.233Z'
          }
        ],
        dates: [],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 1).set('date', 22) // 11 (12 from 1) is outside [09 -> 11]
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return false When the current day is included in the specified weekdays', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Max 15h/jour. Dérogation possible',
        timeIntervals: [],
        weekdays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
      })
    })

    // When
    const currentDate = customDayjs().utc().set('month', 1).set('day', 1) // Monday
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should return true When the current day is not included in the specified weekdays', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: true,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Max 15h/jour. Dérogation possible',
        timeIntervals: [],
        weekdays: ['mardi', 'mercredi', 'jeudi', 'vendredi']
      })
    })

    // When
    const currentDate = customDayjs().utc().day(1) // Monday
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })

  it('Should return false When authorized is false and dates contains a null item', async () => {
    // Given
    const feature = new Feature({
      // The JSON is a string in geoserver
      fishing_period: JSON.stringify({
        annualRecurrence: false,
        authorized: true,
        dateRanges: [],
        dates: [null],
        timeIntervals: [],
        weekdays: []
      })
    })

    // When
    const currentDate = customDayjs().utc()
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(false)
  })

  it('Should parse a property in camel case', async () => {
    // Given
    const feature = new Feature({
      fishingPeriod: {
        annualRecurrence: true,
        authorized: true,
        dateRanges: [],
        dates: [],
        otherInfo: 'Max 15h/jour. Dérogation possible',
        timeIntervals: [],
        weekdays: ['mardi', 'mercredi', 'jeudi', 'vendredi']
      }
    })

    // When
    const currentDate = customDayjs().utc().day(1) // Monday
    expect(isForbiddenPeriod(feature, currentDate)).toEqual(true)
  })
})

function getDateInTheFuture() {
  const MAX_MONTH_IN_YEAR = 12
  const now = customDayjs().utc()
  const currentMonth = now.month() + 1

  if (currentMonth === MAX_MONTH_IN_YEAR) {
    const date = now.add(1, 'year')

    return date.format('YYYY-MM-DD')
  }

  const date = now.add(1, 'month')

  return date.format('YYYY-MM-DD')
}
