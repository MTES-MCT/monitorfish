package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationFleetSegmentSubscription

data class PriorNotificationFleetSegmentSubscriptionDataOutput(
    val controlUnitId: Int,
    val segmentCode: String,
    val segmentName: String?,
) {
    companion object {
        fun fromPriorNotificationSegmentSubscription(
            priorNotificationFleetSegmentSubscription: PriorNotificationFleetSegmentSubscription,
        ): PriorNotificationFleetSegmentSubscriptionDataOutput =
            PriorNotificationFleetSegmentSubscriptionDataOutput(
                controlUnitId = priorNotificationFleetSegmentSubscription.controlUnitId,
                segmentCode = priorNotificationFleetSegmentSubscription.segmentCode,
                segmentName = priorNotificationFleetSegmentSubscription.segmentName,
            )
    }
}
