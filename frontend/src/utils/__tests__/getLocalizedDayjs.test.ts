import { expect } from '@jest/globals'

import { dayjs } from '../dayjs'
import { getLocalizedDayjs } from '../getLocalizedDayjs'

const GUESSED_TIMEZONE = dayjs.tz.guess()

describe('utils/getLocalizedDayjs()', () => {
  it('should return a local date with the same hours and minutes than the UTC date provided', () => {
    const utcDateAsDayjs = dayjs('2022-01-02T03:04:05.006Z')
    const utcDate = utcDateAsDayjs.toDate()

    const result = getLocalizedDayjs(utcDate)

    // 020-01-02T03:04:05.006Z => 020-01-02T03:04:05.006+01:00 (or +02:00 during DST) in Europe/Paris timezone
    expect(result.tz(GUESSED_TIMEZONE).format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toStrictEqual(
      `2022-01-02T03:04:05.006${utcDateAsDayjs.format('Z')}`
    )
  })
})
