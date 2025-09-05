import { describe, expect, it } from '@jest/globals'

import { getLastControlDateTime } from '../utils'

describe('utils/getLastControlDateTime()', () => {
  it('should return undefined when both dates are undefined', () => {
    const result = getLastControlDateTime(undefined, undefined)

    expect(result).toBeUndefined()
  })

  it('should return undefined when both dates are null', () => {
    const result = getLastControlDateTime(undefined, undefined)

    expect(result).toBeUndefined()
  })

  it('should return lastControlAtQuayDateTime when only quay date is provided', () => {
    const quayDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(undefined, quayDate)

    expect(result).toBe(quayDate)
  })

  it('should return lastControlAtSeaDateTime when only sea date is provided', () => {
    const seaDate = '2024-01-10T14:45:00Z'

    const result = getLastControlDateTime(seaDate, undefined)

    expect(result).toBe(seaDate)
  })

  it('should return the most recent date when both dates are provided and quay is more recent', () => {
    const seaDate = '2024-01-10T14:45:00Z'
    const quayDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(seaDate, quayDate)

    expect(result).toBe(quayDate)
  })

  it('should return the most recent date when both dates are provided and sea is more recent', () => {
    const seaDate = '2024-01-20T14:45:00Z'
    const quayDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(seaDate, quayDate)

    expect(result).toBe(seaDate)
  })

  it('should return the same date when both dates are identical', () => {
    const sameDate = '2024-01-15T10:30:00Z'

    const result = getLastControlDateTime(sameDate, sameDate)

    expect(result).toBe(sameDate)
  })

  it('should handle empty strings as falsy values', () => {
    const result = getLastControlDateTime('', '')

    expect(result).toBeUndefined()
  })

  it('should return valid date when one is empty string and other is valid', () => {
    const validDate = '2024-01-15T10:30:00Z'

    const resultWithEmptyQuay = getLastControlDateTime(validDate, '')
    const resultWithEmptySea = getLastControlDateTime('', validDate)

    expect(resultWithEmptyQuay).toBe(validDate)
    expect(resultWithEmptySea).toBe(validDate)
  })
})
