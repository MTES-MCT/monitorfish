package fr.gouv.cnsp.monitorfish.domain.entities.reporting

data class CurrentReporting(
    val id: Int,
    val type: ReportingType,
    val vesselId: Int?,
    val internalReferenceNumber: String?,
)
