import type { UserTarget } from '@utils/isDisplayedForUser'

export type MonitorFishFeature = {
  // ISO 8601
  date: string
  description: string
  for: UserTarget
  title: string
  type: 'IMPROVEMENT' | 'NEW_FEATURE'
}
