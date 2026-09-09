import type { UserTarget } from '@utils/isDisplayedForUser'

export type StartupNotification = {
  /** Markdown. */
  body: string
  for: UserTarget
  /** Stable and unique: it is persisted as the dismissal key, so it must never be reused nor renamed. */
  id: string
  /** Call to action opening an external URL. Without it, the notification only has a "J'ai compris" button. */
  link?: {
    label: string
    url: string
  }
  title: string
  /** ISO 8601 date (exclusive) after which the notification is not displayed anymore. */
  until?: string
}
