import { getLocalizedDayjs } from '@mtes-mct/monitor-ui'

export function getTitleDateFromUtcStringDate(utcStringDate: string): string {
  return getLocalizedDayjs(utcStringDate).format('D MMM à HH:mm')
}
