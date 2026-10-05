import { customDayjs } from '@mtes-mct/monitor-ui'
import { isDisplayedForUser } from '@utils/isDisplayedForUser'

import type { StartupNotification } from '@features/StartupNotification/types'

export function getPendingStartupNotification(
  notifications: StartupNotification[],
  {
    dismissedIds,
    isSuperUser,
    now = customDayjs()
  }: {
    dismissedIds: string[]
    isSuperUser: boolean
    now?: ReturnType<typeof customDayjs>
  }
): StartupNotification | undefined {
  return notifications.find(
    notification =>
      !dismissedIds.includes(notification.id) &&
      isDisplayedForUser(isSuperUser)(notification) &&
      (!notification.until || now.isBefore(notification.until))
  )
}
