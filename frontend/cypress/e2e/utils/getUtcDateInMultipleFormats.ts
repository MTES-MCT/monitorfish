import { customDayjs } from './customDayjs'

export function getUtcDateInMultipleFormats(date?: string) {
  const utcDateAsDayjs = customDayjs(date).utc()

  return {
    utcDateAsDayjs,
    utcDateAsEncodedString: encodeURIComponent(utcDateAsDayjs.toISOString()),

    utcDateAsString: utcDateAsDayjs.toISOString(),
    utcDateAsStringWithoutMs: utcDateAsDayjs.format('YYYY-MM-DDTHH:mm:ss[Z]'),
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
