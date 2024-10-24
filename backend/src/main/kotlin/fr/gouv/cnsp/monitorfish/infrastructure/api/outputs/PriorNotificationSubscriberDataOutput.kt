package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber

data class PriorNotificationSubscriberDataOutput(
    /** Control unit ID. */
    val id: Int,
    val controlUnit: ControlUnitDataOutput,
    val portSubscriptions: List<PriorNotificationPortSubscriptionDataOutput>,
    val segmentSubscriptions: List<PriorNotificationSegmentSubscriptionDataOutput>,
    val vesselSubscriptions: List<PriorNotificationVesselSubscriptionDataOutput>,
) {
    companion object {
        fun fromPriorNotificationSubscriber(
            priorNotificationSubscriber: PriorNotificationSubscriber,
        ): PriorNotificationSubscriberDataOutput {
            val controlUnit = ControlUnitDataOutput.fromFullControlUnit(priorNotificationSubscriber.controlUnit)
            val portSubscriptions =
                priorNotificationSubscriber.portSubscriptions.map {
                    PriorNotificationPortSubscriptionDataOutput.fromPriorNotificationPortSubscription(it)
                }
            val segmentSubscriptions =
                priorNotificationSubscriber.segmentSubscriptions.map {
                    PriorNotificationSegmentSubscriptionDataOutput.fromPriorNotificationSegmentSubscription(it)
                }
            val vesselSubscriptions =
                priorNotificationSubscriber.vesselSubscriptions.map {
                    PriorNotificationVesselSubscriptionDataOutput.fromPriorNotificationVesselSubscription(it)
                }

            return PriorNotificationSubscriberDataOutput(
                id = controlUnit.id,
                controlUnit,
                portSubscriptions,
                segmentSubscriptions,
                vesselSubscriptions,
            )
        }
    }
}
