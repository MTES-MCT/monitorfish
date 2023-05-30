import { customDayjs } from './customDayjs'

export function getUtcDateInMultipleFormats(date?: string) {
  const utcDateAsDayjs = customDayjs(date).utc()

  return {
    utcDateAsDayjs,
    /** ISO string without seconds, milliseconds, and timezone offset */
    utcDateAsShortString: utcDateAsDayjs.toISOString().substring(0, 16),
    utcDateAsString: utcDateAsDayjs.toISOString(),
    utcDateTuple: [utcDateAsDayjs.year(), utcDateAsDayjs.month() + 1, utcDateAsDayjs.date()] as [
      number,
      number,
      number
    ],
    utcDateTupleWithTime: [
      utcDateAsDayjs.year(),
      utcDateAsDayjs.month() + 1,
      utcDateAsDayjs.date(),
      utcDateAsDayjs.hour(),
      utcDateAsDayjs.minute()
    ] as [number, number, number, number, number]
  }
}
