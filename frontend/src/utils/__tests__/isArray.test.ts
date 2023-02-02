import { expect } from '@jest/globals'

import { isArray } from '../isArray'

describe('utils/isArray()', () => {
  it('should return TRUE with an array value', () => {
    expect(isArray([])).toBe(true)
  })

  it('should return FALSE with a non-array value', () => {
    expect(isArray(true)).toBe(false)
    expect(isArray(0)).toBe(false)
    expect(isArray('')).toBe(false)
    expect(isArray(null)).toBe(false)
    expect(isArray(undefined)).toBe(false)

    expect(isArray({})).toBe(false)
    expect(isArray(new Map())).toBe(false)
  })
})
