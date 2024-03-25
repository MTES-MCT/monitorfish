package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter

class LogbookReportFilterDataInput(
    val flagStates: List<String>? = null,
    val isLessThanTwelveMetersVessel: Boolean? = null,
    val lastControlledAfter: String? = null,
    val lastControlledBefore: String? = null,
    val portLocodes: List<String>? = null,
    val priorNotificationTypes: List<String>? = null,
    val searchQuery: String? = null,
    val specyCodes: List<String>? = null,
    val tripSegmentSegments: List<String>? = null,
    val tripGearCodes: List<String>? = null,
    val willArriveAfter: String? = null,
    val willArriveBefore: String? = null,
) {
    fun toLogbookReportFilter() = LogbookReportFilter(
        flagStates = this.flagStates,
        isLessThanTwelveMetersVessel = this.isLessThanTwelveMetersVessel,
        lastControlledAfter = this.lastControlledAfter,
        lastControlledBefore = this.lastControlledBefore,
        portLocodes = this.portLocodes,
        priorNotificationTypes = this.priorNotificationTypes,
        searchQuery = this.searchQuery,
        specyCodes = this.specyCodes,
        tripSegmentSegments = this.tripSegmentSegments,
        tripGearCodes = this.tripGearCodes,
        willArriveAfter = this.willArriveAfter,
        willArriveBefore = this.willArriveBefore,
    )
}
