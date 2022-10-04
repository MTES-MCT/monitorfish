import { dayjs } from './dayjs'

import type { Dayjs } from 'dayjs'

export function getUtcDayjs(): Dayjs {
  return dayjs().utc()
}
