import { describe, expect, it } from '@jest/globals'

import { getDefaultPresentationCodes } from '../utils'

describe('getDefaultPresentationCodes()', () => {
  it('should return [WHL] when EISR is enabled and vessel is below 12m', () => {
    expect(getDefaultPresentationCodes(true, 8)).toEqual(['WHL'])
  })

  it('should return [WHL] when vessel length is just below 12m', () => {
    expect(getDefaultPresentationCodes(true, 11.9)).toEqual(['WHL'])
  })

  it('should return undefined when vessel is exactly 12m', () => {
    expect(getDefaultPresentationCodes(true, 12)).toBeUndefined()
  })

  it('should return undefined when vessel is above 12m', () => {
    expect(getDefaultPresentationCodes(true, 15)).toBeUndefined()
  })

  it('should return undefined when EISR is disabled even if vessel is below 12m', () => {
    expect(getDefaultPresentationCodes(false, 8)).toBeUndefined()
  })

  it('should return undefined when vessel length is unknown', () => {
    expect(getDefaultPresentationCodes(true, undefined)).toBeUndefined()
  })
})
