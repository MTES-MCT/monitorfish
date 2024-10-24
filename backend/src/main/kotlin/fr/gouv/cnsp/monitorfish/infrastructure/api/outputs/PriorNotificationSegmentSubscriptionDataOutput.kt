package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationSegmentSubscription

data class PriorNotificationSegmentSubscriptionDataOutput(
    val controlUnitId: Int,
    val segmentCode: String,
    val segmentName: String?,
) {
    companion object {
        fun fromPriorNotificationSegmentSubscription(
            priorNotificationFleetSegmentSubscription: PriorNotificationSegmentSubscription,
        ): PriorNotificationSegmentSubscriptionDataOutput {
            return PriorNotificationSegmentSubscriptionDataOutput(
                controlUnitId = priorNotificationFleetSegmentSubscription.controlUnitId,
                segmentCode = priorNotificationFleetSegmentSubscription.segmentCode,
                segmentName = priorNotificationFleetSegmentSubscription.segmentName,
            )
        }
    }
}
