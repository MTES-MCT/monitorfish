import { customDayjs } from './customDayjs'

import type { Dayjs } from 'dayjs'

/**
 * Get a Dayjs instance of a locally timezoned date treated as if it was a UTC one.
 *
 * @example
 * ```ts
 * getUtcizedDayjs(2022-01-02T03:04:05.006+01:00)
 * // => `2022-01-02T03:04:05.006Z
 * ```
 */
export function getUtcizedDayjs(localDate?: Date): Dayjs {
  const definedLocalDate = localDate ?? new Date()

  // The number of minutes returned by getTimezoneOffset() is positive if the local time zone is behind UTC,
  // and negative if the local time zone is ahead of UTC. For example, for UTC+10, `-600` will be returned.
  //
  // `Date.getTimezoneOffset()` includes the DST if it is in application during the period of the provided `utcDate`
  // (i.e.: if the date is in winter and we're running locally in Europe/Paris time zone, `-120` will be returned;
  // but if the date was in summer and we're running locally in Europe/Paris time zone, `-60` will be returned).
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset#varied_results_in_daylight_saving_time_dst_regions
  const timezoneOffsetInMinutes = definedLocalDate.getTimezoneOffset()

  return customDayjs(definedLocalDate).utc().subtract(timezoneOffsetInMinutes, 'minutes')
}
