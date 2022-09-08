// TODO Use `date-fns` instead of `dayjs`.

import { dayjs } from '../../utils/dayjs'

import type { Option } from '../../types'
import type { DateTuple, TimeTuple } from './types'

export function formatNumberAsDoubleDigit(numberLike: number | string): string {
  return String(numberLike).padStart(2, '0')
}

export function getDateFromDateAndTimeTuple(dateTuple: DateTuple, timeTuple: TimeTuple, isEnd: boolean = false): Date {
  const [year, month, day] = dateTuple
  const [hour, minute] = timeTuple

  const rawDateAsDayjs = dayjs()
    .year(Number(year))
    .month(Number(month) - 1)
    .date(Number(day))
    .hour(Number(hour))
    .minute(Number(minute))

  return isEnd
    ? rawDateAsDayjs
        .endOf('minute')
        // TODO For some reason the API can't handle miliseconds in dates.
        // That's why we set it to 0 (instead of 999)
        .millisecond(0)
        .toDate()
    : rawDateAsDayjs.startOf('minute').toDate()
}

export function getDateTupleFromDate(date: undefined): undefined
export function getDateTupleFromDate(date: Date): DateTuple
export function getDateTupleFromDate(date?: Date): DateTuple | undefined
export function getDateTupleFromDate(date?: Date): DateTuple | undefined {
  if (!date) {
    return undefined
  }

  return [
    String(date.getFullYear()),
    formatNumberAsDoubleDigit(date.getMonth() + 1),
    formatNumberAsDoubleDigit(date.getDate())
  ]
}

/**
 * Generate a list of ranged time options.
 *
 * @example
 * ```
 * (minutesRange = 30) => ([
 *   { label: '00:00', value: ['00', '00'] },
 *   { label: '00:30', value: ['00', '30'] },
 *   { label: '01:00', value: ['01', '00'] },
 *   { label: '01:30', value: ['01', '30'] },
 *   { label: '02:00', value: ['02', '00'] },
 *   ...
 * ])
 * ```
 */
export const getRangedTimeOptions = (minutesRange: number): Option<TimeTuple>[] => {
  const perHourOptionsLength = 60 / minutesRange
  const totalOptionsLength = 24 * perHourOptionsLength

  return new Array(totalOptionsLength).fill(undefined).map((_, index) => {
    const hour = Math.floor(index / perHourOptionsLength)
    const minute = minutesRange * (index % perHourOptionsLength)
    const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    const value: TimeTuple = [formatNumberAsDoubleDigit(hour), formatNumberAsDoubleDigit(minute)]

    return {
      label,
      value
    }
  })
}

export function getTimeTupleFromDate(date?: Date): TimeTuple | undefined {
  if (!date) {
    return undefined
  }

  return [formatNumberAsDoubleDigit(date.getHours()), formatNumberAsDoubleDigit(date.getMinutes())]
}
