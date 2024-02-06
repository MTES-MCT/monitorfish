import { describe, expect, it } from '@jest/globals'

import { FrontendError } from '../../libs/FrontendError'
import { ensure } from '../ensure'

describe('utils/ensure()', () => {
  it('should return the value if it is defined', () => {
    const value = 'test'

    expect(ensure(value, 'value')).toBe(value)
  })

  it('should throw a FrontendError if the value is undefined', () => {
    expect(() => ensure(undefined, 'value')).toThrow(FrontendError)
    expect(() => ensure(undefined, 'value')).toThrow('`value` is undefined.')
  })
})
