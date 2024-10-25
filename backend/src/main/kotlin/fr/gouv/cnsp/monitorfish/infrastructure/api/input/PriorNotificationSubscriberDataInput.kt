package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription

data class PriorNotificationSubscriberDataInput(
    val controlUnitId: Int,
    val portLocodes: List<String>,
    val portLocodesWithAllNotifications: List<String>,
    val segmentCodes: List<String>,
    val vesselIds: List<Int>,
) {
    fun toSubscriptions(): Triple<List<PriorNotificationPortSubscription>, List<PriorNotificationSegmentSubscription>, List<PriorNotificationVesselSubscription>> {
        val portSubscriptions =
            portLocodes.map { portLocode ->
                val hasSubscribedToAllPriorNotifications = portLocodesWithAllNotifications.contains(portLocode)

                PriorNotificationPortSubscription(controlUnitId, portLocode, null, hasSubscribedToAllPriorNotifications)
            }
        val segmentSubscriptions =
            segmentCodes.map { segmentCode ->
                PriorNotificationSegmentSubscription(controlUnitId, segmentCode, null)
            }
        val vesselSubscriptions =
            vesselIds.map { vesselId ->
                PriorNotificationVesselSubscription(controlUnitId, vesselId, null)
            }

        return Triple(
            portSubscriptions,
            segmentSubscriptions,
            vesselSubscriptions,
        )
    }
}
