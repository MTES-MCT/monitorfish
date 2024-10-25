package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

data class PriorNotificationFleetSegmentSubscription(
    val controlUnitId: Int,
    val segmentCode: String,
    val segmentName: String?,
)
