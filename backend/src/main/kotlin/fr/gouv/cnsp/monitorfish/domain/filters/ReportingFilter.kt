package fr.gouv.cnsp.monitorfish.domain.filters

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType

data class ReportingFilter(
    val isArchived: Boolean? = null,
    val isDeleted: Boolean? = null,
    val types: List<ReportingType>? = null,
)
