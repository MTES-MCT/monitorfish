package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters

data class PriorNotificationsFilter(
    val flagStates: List<String>? = null,
    val hasOneOrMoreReportings: Boolean? = null,
    val isLessThanTwelveMetersVessel: Boolean? = null,
    val lastControlledAfter: String? = null,
    val lastControlledBefore: String? = null,
    val portLocodes: List<String>? = null,
    val priorNotificationTypes: List<String>? = null,
    val searchQuery: String? = null,
    val specyCodes: List<String>? = null,
    val tripGearCodes: List<String>? = null,
    val tripSegmentCodes: List<String>? = null,
    val willArriveAfter: String,
    val willArriveBefore: String,
)
