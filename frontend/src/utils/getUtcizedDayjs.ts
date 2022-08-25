import { dayjs } from './dayjs'

import type { Dayjs } from 'dayjs'

/**
 * Get a Dayjs instance of a locally timezoned date treated as if it was a UTC one
 *
 * @example
 * `2022-01-02T03:04:05.006+01:00` => `2022-01-02T03:04:05.006Z`.
 */
export function getUtcizedDayjs(localDate?: Date): Dayjs {
  const definedLocalDate = localDate || new Date()
  // The number of minutes returned by getTimezoneOffset() is positive if the local time zone is behind UTC,
  // and negative if the local time zone is ahead of UTC. For example, for UTC+10, -600 will be returned.
  const timezoneOffsetInMinutes = definedLocalDate.getTimezoneOffset()

  return dayjs(definedLocalDate).subtract(timezoneOffsetInMinutes, 'minutes')
}
