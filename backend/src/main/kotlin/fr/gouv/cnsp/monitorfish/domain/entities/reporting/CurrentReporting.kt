package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import java.time.ZonedDateTime

data class CurrentReporting(
    val id: Int,
    val type: ReportingType,
    val vesselId: Int?,
    val internalReferenceNumber: String?,
    val creationDate: ZonedDateTime,
)
