import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'
import dayjs from 'dayjs'

import { getColorWithAlpha, getHashDigitsFromString, getStartAndEndDatesSetWithCurrentYear } from './utils'
import { theme } from '../../../../ui/theme'

describe('utils', () => {
  it('getHashDigitsFromRegulation Should return undefined When the regulation is null', async () => {
    // Given
    const regulation = null

    // When
    expect(getHashDigitsFromString(regulation)).toBeUndefined()
  })

  it('getHashDigitsFromRegulation Should return a constant number for a given regulatory zone', async () => {
    // Given
    const regulation = {
      topic: 'Ouest Cotentin Bivalves',
      zone: 'Zone ouest'
    }

    // Then
    expect(getHashDigitsFromString(`${regulation.topic}:${regulation.zone}`)).toEqual(11)
    // Retry to ensure the returned digit is constant
    expect(getHashDigitsFromString(`${regulation.topic}:${regulation.zone}`)).toEqual(11)
  })

  it('getHashDigitsFromRegulation Should return a constant number for another regulatory zone', async () => {
    // Given
    const regulation = {
      topic: 'Ouest Cotentin Bivalves',
      zone: 'Zone nord'
    }

    // When
    expect(getHashDigitsFromString(`${regulation.topic}:${regulation.zone}`)).toEqual(9)
  })

  it('getColorWithAlpha Should add the alpha field on a color', async () => {
    // Given
    const color = theme.color.lightBlue

    // When
    expect(getColorWithAlpha(color, 0.5)).toEqual('rgba(185,221,229,0.5)')
  })

  it('getColorWithAlpha Should add the alpha field on a color When the prussianBlue color is used', async () => {
    // Given
    const color = theme.color.prussianBlue

    // When
    expect(getColorWithAlpha(color, 0.75)).toEqual('rgba(0,52,84,0.75)')
  })

  // Because this function will be replaced with monitor-ui ones.
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('getStartAndEndDatesWithAppliedOffset Should return the date with an offset applied', async () => {
    // Given
    const dateRange = {
      endDate: '2022-11-15T10:26:37.477Z',
      startDate: '2021-09-15T09:25:52.233Z'
    }
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 10).set('day', 22)

    // When
    expect(getStartAndEndDatesSetWithCurrentYear(dateRange, currentDate)).toEqual({
      endDateWithOffsetApplied: dayjs('2022-11-15T10:26:37.477Z'),
      startDateWithOffsetApplied: dayjs('2022-09-15T09:25:52.233Z')
    })
  })

  // Because this function will be replaced with monitor-ui ones.
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('getStartAndEndDatesSetWithCurrentYear Should return the date with another offset applied', async () => {
    // Given
    const dateRange = {
      endDate: '2008-11-15T10:26:37.477Z',
      startDate: '2008-09-15T09:25:52.233Z'
    }
    const currentDate = customDayjs().utc().set('year', 2022).set('month', 10).set('day', 22)

    // When
    expect(getStartAndEndDatesSetWithCurrentYear(dateRange, currentDate)).toEqual({
      endDateWithOffsetApplied: dayjs('2022-11-15T10:26:37.477Z'),
      startDateWithOffsetApplied: dayjs('2022-09-15T09:25:52.233Z')
    })
  })
})
