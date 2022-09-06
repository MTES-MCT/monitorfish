import { expect } from '@jest/globals'
import dayjs from 'dayjs'

import { getLocalizedDayjs } from '../../../utils/getLocalizedDayjs'
import { getTimeTupleFromDate } from '../utils'

describe('ui/DateRangePicker/utils.getTimeTupleFromDate()', () => {
  it('should return the expected time tuple from a date', () => {
    const localizedDate = getLocalizedDayjs(dayjs('2022-03-04T01:02:00.000Z').toDate()).toDate()

    const result = getTimeTupleFromDate(localizedDate)

    expect(result).toMatchObject(['01', '02'] as any)
  })
})
