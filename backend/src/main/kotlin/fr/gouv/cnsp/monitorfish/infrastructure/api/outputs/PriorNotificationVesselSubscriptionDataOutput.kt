package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationVesselSubscription

data class PriorNotificationVesselSubscriptionDataOutput(
    val controlUnitId: Int,
    val vesselId: Int,
    val vesselName: String?,
) {
    companion object {
        fun fromPriorNotificationVesselSubscription(
            priorNotificationFleetVesselSubscription: PriorNotificationVesselSubscription,
        ): PriorNotificationVesselSubscriptionDataOutput {
            return PriorNotificationVesselSubscriptionDataOutput(
                controlUnitId = priorNotificationFleetVesselSubscription.controlUnitId,
                vesselId = priorNotificationFleetVesselSubscription.vesselId,
                vesselName = priorNotificationFleetVesselSubscription.vesselName,
            )
        }
    }
}
