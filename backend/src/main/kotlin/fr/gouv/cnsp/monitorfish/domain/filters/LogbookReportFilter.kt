package fr.gouv.cnsp.monitorfish.domain.filters

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselId

data class LogbookReportFilter(
    val flagStates: List<String>? = null,
    val integratedAfter: String? = null,
    val integratedBefore: String? = null,
    val portLocodes: List<String>? = null,
    val searchQuery: String? = null,
    val specyCodes: List<String>? = null,
    val tripSegmentSegments: List<String>? = null,
    val tripGearCodes: List<String>? = null,
    val vesselId: VesselId? = null,
)
