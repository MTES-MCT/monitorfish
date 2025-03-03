import { binarySearchLine } from '@features/Logbook/useCases/displayedLogbookOverlays/utils'
import { describe, expect, it } from '@jest/globals'
import dayjs from 'dayjs'

const sortedLines = [
  { end: dayjs('2023-03-01T08:30:00'), line: 'Line 1', start: dayjs('2023-03-01T08:00:00') },
  { end: dayjs('2023-03-01T09:00:00'), line: 'Line 2', start: dayjs('2023-03-01T08:30:00') },
  { end: dayjs('2023-03-01T09:30:00'), line: 'Line 3', start: dayjs('2023-03-01T09:00:00') },
  { end: dayjs('2023-03-01T10:00:00'), line: 'Line 4', start: dayjs('2023-03-01T09:30:00') },
  { end: dayjs('2023-03-01T10:30:00'), line: 'Line 5', start: dayjs('2023-03-01T10:00:00') },
  { end: dayjs('2023-03-01T11:00:00'), line: 'Line 6', start: dayjs('2023-03-01T10:30:00') },
  { end: dayjs('2023-03-01T11:30:00'), line: 'Line 7', start: dayjs('2023-03-01T11:00:00') },
  { end: dayjs('2023-03-01T12:00:00'), line: 'Line 8', start: dayjs('2023-03-01T11:30:00') },
  { end: dayjs('2023-03-01T12:30:00'), line: 'Line 9', start: dayjs('2023-03-01T12:00:00') },
  { end: dayjs('2023-03-01T13:00:00'), line: 'Line 10', start: dayjs('2023-03-01T12:30:00') },
  { end: dayjs('2023-03-01T13:30:00'), line: 'Line 11', start: dayjs('2023-03-01T13:00:00') },
  { end: dayjs('2023-03-01T14:00:00'), line: 'Line 12', start: dayjs('2023-03-01T13:30:00') },
  { end: dayjs('2023-03-01T14:30:00'), line: 'Line 13', start: dayjs('2023-03-01T14:00:00') },
  { end: dayjs('2023-03-01T15:00:00'), line: 'Line 14', start: dayjs('2023-03-01T14:30:00') },
  { end: dayjs('2023-03-01T15:30:00'), line: 'Line 15', start: dayjs('2023-03-01T15:00:00') },
  { end: dayjs('2023-03-01T16:00:00'), line: 'Line 16', start: dayjs('2023-03-01T15:30:00') },
  { end: dayjs('2023-03-01T16:30:00'), line: 'Line 17', start: dayjs('2023-03-01T16:00:00') },
  { end: dayjs('2023-03-01T17:00:00'), line: 'Line 18', start: dayjs('2023-03-01T16:30:00') },
  { end: dayjs('2023-03-01T17:30:00'), line: 'Line 19', start: dayjs('2023-03-01T17:00:00') },
  { end: dayjs('2023-03-01T18:00:00'), line: 'Line 20', start: dayjs('2023-03-01T17:30:00') }
]

describe('utils/binarySearchLine()', () => {
  it('should return the correct line for an activity datetime within the range', () => {
    const activityDateTime = dayjs('2023-03-01T09:15:00') // This falls between Line 3 and Line 4
    const result = binarySearchLine(activityDateTime, sortedLines)
    expect(result).toBe('Line 3') // The closest valid track line
  })

  it('should return the correct line when the activity datetime is exactly at the start of a line', () => {
    const activityDateTime = dayjs('2023-03-01T10:00:00') // Exactly at the start of Line 5
    const result = binarySearchLine(activityDateTime, sortedLines)
    expect(result).toBe('Line 5')
  })

  it('should return undefined if no lines match the datetime', () => {
    const activityDateTime = dayjs('2023-03-01T06:00:00') // Before the first line's start
    const result = binarySearchLine(activityDateTime, sortedLines)
    expect(result).toBeUndefined()
  })

  it('should return the correct line for an activity datetime exactly within the range of the last line', () => {
    const activityDateTime = dayjs('2023-03-01T17:30:00') // Exactly at the end of Line 20
    const result = binarySearchLine(activityDateTime, sortedLines)
    expect(result).toBe('Line 20')
  })

  it('should return the correct line for an activity datetime within the range of the middle of the lines', () => {
    const activityDateTime = dayjs('2023-03-01T12:15:00') // Between Line 9 and Line 10
    const result = binarySearchLine(activityDateTime, sortedLines)
    expect(result).toBe('Line 9')
  })
})
