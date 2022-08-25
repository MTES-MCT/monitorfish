import { expect } from '@jest/globals'

import { getUtcizedDayjs } from '../getUtcizedDayjs'

describe('utils/getUtcizedDayjs()', () => {
  it('should return a UTC date with the same hours and minutes than the local date provided', () => {
    const localDate = new Date('2022-01-02T03:04:05.006')

    const result = getUtcizedDayjs(localDate)

    expect(result.toISOString()).toStrictEqual('2022-01-02T03:04:05.006Z')
  })
})
