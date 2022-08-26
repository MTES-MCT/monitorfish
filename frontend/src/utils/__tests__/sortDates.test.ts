import { expect } from '@jest/globals'

import { sortDates } from '../sortDates'

describe('utils/sortDates()', () => {
  const firstDate = new Date('2022-01-01T00:00:00.000')
  const secondDate = new Date('2022-01-02T00:00:00.000')

  it('should return a sorted list of dates with an already sorted list of dates', () => {
    const dates = [firstDate, secondDate]

    const result = sortDates(dates)

    expect(result).toStrictEqual([firstDate, secondDate])
  })

  it('should return a sorted list of dates with an unsorted list of dates', () => {
    const dates = [secondDate, firstDate]

    const result = sortDates(dates)

    expect(result).toStrictEqual([firstDate, secondDate])
  })
})
