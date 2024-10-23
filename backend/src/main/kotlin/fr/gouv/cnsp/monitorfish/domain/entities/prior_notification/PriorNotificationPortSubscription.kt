package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

data class PriorNotificationPortSubscription(
    val controlUnitId: Int,
    val portLocode: String,
    val hasSubscribedToAllPriorNotifications: Boolean,
)
