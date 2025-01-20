package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription

data class PriorNotificationVesselSubscriptionDataOutput(
    val controlUnitId: Int,
    val vesselId: Int,
    val vesselCallSign: String?,
    val vesselCfr: String?,
    val vesselExternalMarking: String?,
    val vesselMmsi: String?,
    val vesselName: String?,
) {
    companion object {
        fun fromPriorNotificationVesselSubscription(
            priorNotificationFleetVesselSubscription: PriorNotificationVesselSubscription,
        ): PriorNotificationVesselSubscriptionDataOutput =
            PriorNotificationVesselSubscriptionDataOutput(
                controlUnitId = priorNotificationFleetVesselSubscription.controlUnitId,
                vesselId = priorNotificationFleetVesselSubscription.vesselId,
                vesselCallSign = priorNotificationFleetVesselSubscription.vesselCallSign,
                vesselCfr = priorNotificationFleetVesselSubscription.vesselCfr,
                vesselExternalMarking = priorNotificationFleetVesselSubscription.vesselExternalMarking,
                vesselMmsi = priorNotificationFleetVesselSubscription.vesselMmsi,
                vesselName = priorNotificationFleetVesselSubscription.vesselName,
            )
    }
}
