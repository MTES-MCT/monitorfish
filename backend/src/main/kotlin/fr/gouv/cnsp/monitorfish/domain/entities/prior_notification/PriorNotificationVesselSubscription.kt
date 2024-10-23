package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

data class PriorNotificationVesselSubscription(
    val controlUnitId: Int,
    val vesselId: Int,
    val vesselName: String?,
)
