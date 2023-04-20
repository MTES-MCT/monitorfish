import { customDayjs } from './customDayjs'

import type { Dayjs } from 'dayjs'

/**
 * Get a Dayjs instance of a UTC date treated as if it was a locally timezoned one.
 *
 * @example
 * When run in Europe/Paris time zone while DST is not in application:
 * ```ts
 * getLocalizedDayjs(2022-01-02T03:04:05.006Z)`
 * // => `2022-01-02T03:04:05.006+01:00`
 * ```
 *
 * When run in Europe/Paris time zone while DST is in application:
 * ```ts
 * getLocalizedDayjs(2022-01-02T03:04:05.006Z)`
 * // => `2022-01-02T03:04:05.006+02:00`
 * ```
 *
 * When run in UTC time zone (there is no DST in UTC):
 * ```ts
 * getLocalizedDayjs(2022-01-02T03:04:05.006Z)`
 * // => `2022-01-02T03:04:05.006Z`
 * ```
 */
export function getLocalizedDayjs(utcDate: Date | string): Dayjs {
  const controlledUtcDate = typeof utcDate === 'string' ? new Date(utcDate) : utcDate

  // The number of minutes returned by getTimezoneOffset() is positive if the local time zone is behind UTC,
  // and negative if the local time zone is ahead of UTC. For example, for UTC+10, `-600` will be returned.
  //
  // `Date.getTimezoneOffset()` includes the DST if it is in application during the period of the provided `utcDate`
  // (i.e.: if the date is in winter and we're running locally in Europe/Paris time zone, `-120` will be returned;
  // but if the date was in summer and we're running locally in Europe/Paris time zone, `-60` will be returned).
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset#varied_results_in_daylight_saving_time_dst_regions
  const timezoneOffsetInMinutes = controlledUtcDate.getTimezoneOffset()

  return customDayjs(utcDate).add(timezoneOffsetInMinutes, 'minutes')
}
