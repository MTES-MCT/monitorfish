import { describe, expect, it } from '@jest/globals'

import { getDefaultPresentationCode } from '../utils'

describe('getDefaultPresentationCode()', () => {
  it('should return WHL when EISR is enabled and vessel is below 12m', () => {
    expect(getDefaultPresentationCode(true, 8)).toBe('WHL')
  })

  it('should return WHL when vessel length is just below 12m', () => {
    expect(getDefaultPresentationCode(true, 11.9)).toBe('WHL')
  })

  it('should return undefined when vessel is exactly 12m', () => {
    expect(getDefaultPresentationCode(true, 12)).toBeUndefined()
  })

  it('should return undefined when vessel is above 12m', () => {
    expect(getDefaultPresentationCode(true, 15)).toBeUndefined()
  })

  it('should return undefined when EISR is disabled even if vessel is below 12m', () => {
    expect(getDefaultPresentationCode(false, 8)).toBeUndefined()
  })

  it('should return undefined when vessel length is unknown', () => {
    expect(getDefaultPresentationCode(true, undefined)).toBeUndefined()
  })
})
