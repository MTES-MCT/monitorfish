import dayjs, { type Dayjs, isDayjs } from 'dayjs'

export function isDateCloseTo(
  leftDate: string | Date | Dayjs,
  rightDate: string | Date | Dayjs,
  thresholdInSeconds: number
): boolean {
  const leftDateAsDayjs: Dayjs = isDayjs(leftDate) ? leftDate : dayjs(leftDate)
  const rightDateAsDayjs: Dayjs = isDayjs(rightDate) ? rightDate : dayjs(leftDate)

  return Math.abs(leftDateAsDayjs.diff(rightDateAsDayjs, 'second')) <= thresholdInSeconds
}
