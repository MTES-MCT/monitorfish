package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotificationSubscriber

data class PriorNotificationSubscriberDataOutput(
    val controlUnit: ControlUnitDataOutput,
    val fleetSegmentSubscriptions: List<PriorNotificationFleetSegmentSubscriptionDataOutput>,
    val portSubscriptions: List<PriorNotificationPortSubscriptionDataOutput>,
    val vesselSubscriptions: List<PriorNotificationVesselSubscriptionDataOutput>,
) {
    companion object {
        fun fromPriorNotificationSubscriber(
            priorNotificationSubscriber: PriorNotificationSubscriber,
        ): PriorNotificationSubscriberDataOutput {
            val controlUnit = ControlUnitDataOutput.fromFullControlUnit(priorNotificationSubscriber.controlUnit)
            val fleetSegmentSubscriptions =
                priorNotificationSubscriber.fleetSegmentSubscriptions.map {
                    PriorNotificationFleetSegmentSubscriptionDataOutput.fromPriorNotificationSegmentSubscription(it)
                }
            val portSubscriptions =
                priorNotificationSubscriber.portSubscriptions.map {
                    PriorNotificationPortSubscriptionDataOutput.fromPriorNotificationPortSubscription(it)
                }
            val vesselSubscriptions =
                priorNotificationSubscriber.vesselSubscriptions.map {
                    PriorNotificationVesselSubscriptionDataOutput.fromPriorNotificationVesselSubscription(it)
                }

            return PriorNotificationSubscriberDataOutput(
                controlUnit,
                fleetSegmentSubscriptions,
                portSubscriptions,
                vesselSubscriptions,
            )
        }
    }
}
