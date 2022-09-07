import { dayjs } from './dayjs'

import type { Dayjs } from 'dayjs'

/**
 * Get a Dayjs instance of a UTC date treated as if it was a locally timezoned one
 *
 * @example
 * `2022-01-02T03:04:05.006Z` => `2022-01-02T03:04:05.006+01:00` (or `+02:00` during DST) in Europe/Paris timezone.
 */
export function getLocalizedDayjs(utcDate: Date): Dayjs {
  // The number of minutes returned by getTimezoneOffset() is positive if the local time zone is behind UTC,
  // and negative if the local time zone is ahead of UTC. For example, for UTC+10, -600 will be returned.
  const timezoneOffsetInMinutes = utcDate.getTimezoneOffset()

  return dayjs(utcDate).add(timezoneOffsetInMinutes, 'minutes')
}
