import { expect } from '@jest/globals'
import dayjs from 'dayjs'

import { getLocalizedDayjs } from '../../../utils/getLocalizedDayjs'
import { getDateTupleFromDate } from '../utils'

describe('ui/DateRangePicker/utils.getDateTupleFromDate()', () => {
  it('should return the expected date tuple from a date', () => {
    const localizedDate = getLocalizedDayjs(dayjs('2022-03-04T01:02:00.000Z').toDate()).toDate()

    const result = getDateTupleFromDate(localizedDate)

    expect(result).toMatchObject([2022, 3, 4] as any)
  })
})
