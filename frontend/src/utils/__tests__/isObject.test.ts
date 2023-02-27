import { expect } from '@jest/globals'

import { isObject } from '../isObject'

describe('utils/isObject()', () => {
  it('should return TRUE with a native object value', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ foo: 'bar' })).toBe(true)
  })

  it('should return FALSE with a non-object value', () => {
    expect(isObject(true)).toBe(false)
    expect(isObject(0)).toBe(false)
    expect(isObject('')).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
  })

  it('should return FALSE with a non-native object value', () => {
    expect(isObject([])).toBe(false)
    expect(isObject(new Error())).toBe(false)
  })
})
