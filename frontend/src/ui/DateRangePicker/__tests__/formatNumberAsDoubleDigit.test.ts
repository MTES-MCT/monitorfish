import { expect } from '@jest/globals'

import { formatNumberAsDoubleDigit } from '../utils'

describe('ui/DateRangePicker/utils.formatNumberAsDoubleDigit()', () => {
  it('should return a double-digit number string with a single-digit number', () => {
    const number = 1

    const result = formatNumberAsDoubleDigit(number)

    expect(result).toStrictEqual('01')
  })

  it('should return a double-digit number string with a double-digit number', () => {
    const number = 10

    const result = formatNumberAsDoubleDigit(number)

    expect(result).toStrictEqual('10')
  })
})
