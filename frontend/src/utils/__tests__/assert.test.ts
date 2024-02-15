import { describe, expect, it } from '@jest/globals'

import { mockConsole } from '../../../__mocks__/utils'
import { FrontendError } from '../../libs/FrontendError'
import { assert } from '../assert'

describe('utils/assert()', () => {
  mockConsole()

  it('should not throw an error if the value is defined', () => {
    const value = 'test'

    expect(() => assert(value, 'value')).not.toThrow()
  })

  it('should throw a FrontendError if the value is undefined', () => {
    expect(() => assert(undefined, 'value')).toThrow(FrontendError)
    expect(() => assert(undefined, 'value')).toThrow('`value` is undefined.')
  })
})
