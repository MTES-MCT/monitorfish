package fr.gouv.cnsp.monitorfish.domain.filters

data class PriorNotificationFilter(
    val countryCodes: List<String>? = null,
    val fleetSegmentSegments: List<String>? = null,
    val gearCodes: List<String>? = listOf(),
    val hasOneOrMoreReportings: Boolean? = null,
    val isLessThanTwelveMetersVessel: Boolean? = null,
    val isSent: Boolean? = null,
    val isVesselPretargeted: Boolean? = null,
    val lastControlStartDate: String? = null,
    val lastControlEndDate: String? = null,
    val portLocodes: List<String>? = null,
    val query: String? = null,
    val receivedAtStartDate: String? = null,
    val receivedAtEndDate: String? = null,
    // val seaFrontGroup: SeaFrontGroup | 'EXTRA',
    val specyCodes: List<String>? = null,
    val searchQuery: String? = null,
    // val types: PriorNotification.PriorNotificationType[]
)
