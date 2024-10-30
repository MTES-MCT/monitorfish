package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription

data class PriorNotificationSubscriberDataInput(
    val controlUnitId: Int,
    val fleetSegmentCodes: List<String>,
    val portLocodes: List<String>,
    val portLocodesWithFullSubscription: List<String>,
    val vesselIds: List<Int>,
) {
    fun toSubscriptions(): Triple<List<PriorNotificationFleetSegmentSubscription>, List<PriorNotificationPortSubscription>, List<PriorNotificationVesselSubscription>> {
        val fleetSegmentSubscriptions =
            fleetSegmentCodes.map { segmentCode ->
                PriorNotificationFleetSegmentSubscription(controlUnitId, segmentCode, null)
            }
        val portSubscriptions =
            portLocodes.map { portLocode ->
                val hasSubscribedToAllPriorNotifications = portLocodesWithFullSubscription.contains(portLocode)

                PriorNotificationPortSubscription(controlUnitId, portLocode, null, hasSubscribedToAllPriorNotifications)
            }
        val vesselSubscriptions =
            vesselIds.map { vesselId ->
                PriorNotificationVesselSubscription(
                    controlUnitId,
                    vesselId,
                    vesselCallSign = null,
                    vesselCfr = null,
                    vesselExternalMarking = null,
                    vesselMmsi = null,
                    vesselName = null,
                )
            }

        return Triple(
            fleetSegmentSubscriptions,
            portSubscriptions,
            vesselSubscriptions,
        )
    }
}
