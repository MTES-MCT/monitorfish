import type { PriorNotificationSubscriber } from '@features/PriorNotification/PriorNotificationSubscriber.types'

export function getFormDataFromSubscriber(
  subscriber: PriorNotificationSubscriber.Subscriber
): PriorNotificationSubscriber.FormData {
  return {
    controlUnitId: subscriber.controlUnit.id,
    fleetSegmentCodes: subscriber.fleetSegmentSubscriptions.map(subscription => subscription.segmentCode),
    portLocodes: subscriber.portSubscriptions.map(subscription => subscription.portLocode),
    portLocodesWithFullSubscription: subscriber.portSubscriptions
      .filter(subscription => subscription.hasSubscribedToAllPriorNotifications)
      .map(subscription => subscription.portLocode),
    vesselIds: subscriber.vesselSubscriptions.map(subscription => subscription.vesselId)
  }
}
