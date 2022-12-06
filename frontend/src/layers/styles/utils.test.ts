// TODO Remove legacy colors.

import { describe, expect, it } from '@jest/globals'
import dayjs from 'dayjs'

import { theme } from '../../ui/theme'
import { getUtcDayjs } from '../../utils/getUtcDayjs'
import { getColorWithAlpha, getStartAndEndDatesSetWithCurrentYear } from './utils'

describe('utils', () => {
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

  it('getStartAndEndDatesWithAppliedOffset Should return the date with an offset applied', async () => {
    // Given
    const dateRange = {
      endDate: '2022-11-15T10:26:37.477Z',
      startDate: '2021-09-15T09:25:52.233Z'
    }
    const currentDate = getUtcDayjs().set('year', 2022).set('month', 10).set('day', 22)

    // When
    expect(getStartAndEndDatesSetWithCurrentYear(dateRange, currentDate)).toEqual({
      endDateWithOffsetApplied: dayjs('2022-11-15T10:26:37.477Z'),
      startDateWithOffsetApplied: dayjs('2022-09-15T09:25:52.233Z')
    })
  })

  it('getStartAndEndDatesSetWithCurrentYear Should return the date with another offset applied', async () => {
    // Given
    const dateRange = {
      endDate: '2008-11-15T10:26:37.477Z',
      startDate: '2008-09-15T09:25:52.233Z'
    }
    const currentDate = getUtcDayjs().set('year', 2022).set('month', 10).set('day', 22)

    // When
    expect(getStartAndEndDatesSetWithCurrentYear(dateRange, currentDate)).toEqual({
      endDateWithOffsetApplied: dayjs('2022-11-15T10:26:37.477Z'),
      startDateWithOffsetApplied: dayjs('2022-09-15T09:25:52.233Z')
    })
  })
})
