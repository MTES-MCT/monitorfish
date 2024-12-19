import { Ellipsised } from '@components/Ellipsised'
import { isNotNullish } from '@utils/isNotNullish'

import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'
import type { CellContext } from '@tanstack/react-table'

export function getSubscriberPortNames(
  cell: CellContext<PriorNotificationSubscriber.Subscriber, PriorNotificationSubscriber.PortSubscription[]>
) {
  const portNames = cell
    .getValue()
    .map(portSubscription => portSubscription.portName)
    .filter(isNotNullish)
    .sort()

  if (!portNames.length) {
    return <em>Aucun</em>
  }

  return <Ellipsised maxWidth={450}>{portNames.join(', ')}</Ellipsised>
}

export function getSubscriberPortNamesWithAllNotifications(
  cell: CellContext<PriorNotificationSubscriber.Subscriber, PriorNotificationSubscriber.PortSubscription[]>
) {
  const portNames = cell
    .getValue()
    .filter(portSubscription => portSubscription.hasSubscribedToAllPriorNotifications)
    .map(portSubscription => portSubscription.portName)
    .filter(isNotNullish)
    .sort()

  if (!portNames.length) {
    return <em>Aucun</em>
  }

  return <Ellipsised>{portNames.join(', ')}</Ellipsised>
}
