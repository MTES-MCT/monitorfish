import { describe, expect, it } from '@jest/globals'

import { mockConsole } from '../../../__mocks__/utils'
import { FrontendError } from '../../libs/FrontendError'
import { ensure } from '../ensure'

describe('utils/ensure()', () => {
  mockConsole()

  it('should return the value if it is defined', () => {
    const value = 'test'
    const variableName = 'value'

    const result = ensure(value, variableName)

    expect(result).toBe(value)
  })

  it('should throw a FrontendError if the value is undefined', () => {
    const value = undefined
    const variableName = 'value'

    const call = () => ensure(value, variableName)

    expect(call).toThrow(FrontendError)
    expect(call).toThrow('`value` is undefined.')
  })
})
