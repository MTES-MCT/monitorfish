package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters

data class PriorNotificationSubscribersFilter(
    val administrationId: Int? = null,
    val portLocode: String? = null,
    val searchQuery: String? = null,
)
