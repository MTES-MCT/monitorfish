import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(timezone)
dayjs.extend(utc)

export class CustomDate {
  /**
   * @param {Date=} date
   */
  constructor(date) {
    this.date = dayjs(date).utc(true)
  }

  /**
   * @param {Date} date
   * @returns {Date}
   */
  static fixOffset(date) {
    const timezone = dayjs.tz.guess()
    const utcOffset = dayjs().utcOffset()

    return dayjs(date).subtract(utcOffset, 'minutes').tz(timezone).toDate()
  }

  /**
   * @return {Date}
   */
  toEndOfDay() {
    // TODO For some reason the API can't handle miliseconds in date.
    return this.date.endOf('day').millisecond(0).toDate()
  }

  /**
   * @return {Date}
   */
  toStartOfDay() {
    return this.date.startOf('day').toDate()
  }
}
