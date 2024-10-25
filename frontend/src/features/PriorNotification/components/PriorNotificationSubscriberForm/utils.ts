import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'

export function getSubscriberFormDataFromSubscriber(
  subscriber: PriorNotificationSubscriber.Subscriber
): PriorNotificationSubscriber.FormData {
  return {
    controlUnitId: subscriber.id,
    portLocodes: subscriber.portSubscriptions.map(subscription => subscription.portLocode),
    portLocodesWithAllNotifications: subscriber.portSubscriptions
      .filter(subscription => subscription.hasSubscribedToAllPriorNotifications)
      .map(subscription => subscription.portLocode),
    segmentCodes: subscriber.segmentSubscriptions.map(subscription => subscription.segmentCode),
    vesselIds: subscriber.vesselSubscriptions.map(subscription => subscription.vesselId)
  }
}
