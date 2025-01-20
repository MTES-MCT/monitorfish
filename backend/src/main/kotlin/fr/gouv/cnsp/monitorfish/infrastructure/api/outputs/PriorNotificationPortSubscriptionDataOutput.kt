package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationPortSubscription

data class PriorNotificationPortSubscriptionDataOutput(
    val controlUnitId: Int,
    val hasSubscribedToAllPriorNotifications: Boolean,
    val portLocode: String,
    val portName: String?,
) {
    companion object {
        fun fromPriorNotificationPortSubscription(
            priorNotificationPortSubscription: PriorNotificationPortSubscription,
        ): PriorNotificationPortSubscriptionDataOutput =
            PriorNotificationPortSubscriptionDataOutput(
                controlUnitId = priorNotificationPortSubscription.controlUnitId,
                hasSubscribedToAllPriorNotifications = priorNotificationPortSubscription.hasSubscribedToAllPriorNotifications,
                portLocode = priorNotificationPortSubscription.portLocode,
                portName = priorNotificationPortSubscription.portName,
            )
    }
}
