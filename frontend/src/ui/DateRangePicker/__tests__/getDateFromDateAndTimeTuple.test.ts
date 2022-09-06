import { expect } from '@jest/globals'

import { getUtcizedDayjs } from '../../../utils/getUtcizedDayjs'
import { getDateFromDateAndTimeTuple } from '../utils'

import type { DateTuple, TimeTuple } from '../types'

describe('ui/DateRangePicker/utils.getDateFromDateAndTimeTuple()', () => {
  it('should return the expected date from a date and a time tuple', () => {
    const dateTuple = ['2022', '02', '01'] as DateTuple
    const timeTuple = ['03', '04'] as TimeTuple

    const result = getDateFromDateAndTimeTuple(dateTuple, timeTuple)

    expect(getUtcizedDayjs(result).toISOString()).toStrictEqual('2022-02-01T03:04:00.000Z')
  })

  it('should return the expected date from a date and a time tuple with `isEnd` = `true`', () => {
    const dateTuple = ['2022', '02', '01'] as DateTuple
    const timeTuple = ['03', '04'] as TimeTuple

    const result = getDateFromDateAndTimeTuple(dateTuple, timeTuple, true)

    expect(getUtcizedDayjs(result).toISOString()).toStrictEqual('2022-02-01T03:04:59.000Z')
  })
})
