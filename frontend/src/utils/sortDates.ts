import { dayjs } from './dayjs'

export function sortDates(dates: Date[]): Date[] {
  return dates
    .map(date => date.toISOString())
    .sort()
    .map(dateAsIsoString => dayjs(dateAsIsoString).toDate())
}
