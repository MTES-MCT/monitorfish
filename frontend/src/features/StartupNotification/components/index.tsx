import { NotificationDialog } from '@features/StartupNotification/components/NotificationDialog'
import { STARTUP_NOTIFICATIONS } from '@features/StartupNotification/constants'
import { startupNotificationActions } from '@features/StartupNotification/slice'
import { getPendingStartupNotification } from '@features/StartupNotification/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { isCypress } from '@utils/isCypress'
import { isPuppeteer } from '@utils/isPuppeteer'
import { useMemo } from 'react'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'

export function StartupNotification() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const dismissedIds = useMainAppSelector(state => state.startupNotification.dismissedIds)

  const notification = useMemo(
    () => getPendingStartupNotification(STARTUP_NOTIFICATIONS, { dismissedIds, isSuperUser }),
    [dismissedIds, isSuperUser]
  )

  if (!notification || isCypress() || isPuppeteer()) {
    return null
  }

  const dismiss = () => {
    dispatch(startupNotificationActions.dismiss(notification.id))
  }

  const confirm = () => {
    if (notification.link) {
      trackEvent({
        action: `Ouverture du lien de la notification "${notification.title}"`,
        category: 'DISPLAY_FEATURE',
        name: isSuperUser ? 'CNSP' : 'EXT'
      })

      window.open(notification.link.url, '_blank', 'noopener,noreferrer')
    }

    dismiss()
  }

  return <NotificationDialog notification={notification} onConfirm={confirm} onDismiss={dismiss} />
}
