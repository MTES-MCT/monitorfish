import { isDateCloseTo } from '@features/PriorNotification/components/shared/EditHistory/utils'
import { describe, expect, it } from '@jest/globals'
import dayjs from 'dayjs'

describe('features/PriorNotificationList/shared/EditHistory/utils', () => {
  it('isDateCloseTo() should return true when dates are within the threshold', () => {
    // Given
    const leftDate = dayjs('2024-01-01T10:00:00')
    const rightDate = dayjs('2024-01-01T10:00:10')
    const thresholdInSeconds = 10

    // When Then
    expect(isDateCloseTo(leftDate, rightDate, thresholdInSeconds)).toBe(true)
  })

  it('isDateCloseTo() should return false when dates exceed the threshold', () => {
    // Given
    const leftDate = dayjs('2024-01-01T10:00:00')
    const rightDate = dayjs('2024-01-01T10:01:00')
    const thresholdInSeconds = 30

    // When Then
    expect(isDateCloseTo(leftDate, rightDate, thresholdInSeconds)).toBe(false)
  })

  it('isDateCloseTo() should handle different date formats (string, Date, Dayjs) and return true for close dates', () => {
    // Given
    const leftDate = '2024-01-01T10:00:00'
    const rightDate = new Date('2024-01-01T10:00:05')
    const thresholdInSeconds = 10

    // When Then
    expect(isDateCloseTo(leftDate, rightDate, thresholdInSeconds)).toBe(true)
  })

  it('isDateCloseTo() should handle different date formats (string, Date, Dayjs) and return false for far dates', () => {
    // Given
    const leftDate = new Date('2024-01-01T10:00:00')
    const rightDate = dayjs('2024-01-01T10:01:00')
    const thresholdInSeconds = 30

    // When Then
    expect(isDateCloseTo(leftDate, rightDate, thresholdInSeconds)).toBe(false)
  })

  it('isDateCloseTo() should return true when dates are exactly at the threshold limit', () => {
    // Given
    const leftDate = dayjs('2024-01-01T10:00:00')
    const rightDate = dayjs('2024-01-01T10:01:00')
    const thresholdInSeconds = 60

    // When Then
    expect(isDateCloseTo(leftDate, rightDate, thresholdInSeconds)).toBe(true)
  })

  it('isDateCloseTo() should return true for identical dates with any threshold', () => {
    // Given
    const date = dayjs('2024-01-01T10:00:00')
    const thresholdInSeconds = 0

    // When Then
    expect(isDateCloseTo(date, date, thresholdInSeconds)).toBe(true)
  })
})
