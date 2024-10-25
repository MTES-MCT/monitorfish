package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

data class PriorNotificationVesselSubscription(
    val controlUnitId: Int,
    val vesselId: Int,
    val vesselCallSign: String?,
    val vesselCfr: String?,
    val vesselExternalMarking: String?,
    val vesselMmsi: String?,
    val vesselName: String?,
)
