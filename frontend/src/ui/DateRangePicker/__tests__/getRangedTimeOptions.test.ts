import { expect } from '@jest/globals'

import { getRangedTimeOptions } from '../utils'

describe('ui/DateRangePicker/utils.getRangedTimeOptions()', () => {
  it('should return the expected array of options', () => {
    const minutesRange = 15

    const result = getRangedTimeOptions(minutesRange)

    expect(result).toMatchSnapshot()
  })
})
