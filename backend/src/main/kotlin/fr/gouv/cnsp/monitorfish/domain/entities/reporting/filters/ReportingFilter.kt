package fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import java.time.ZonedDateTime

data class ReportingFilter(
    val isArchived: Boolean? = null,
    val isDeleted: Boolean? = null,
    val types: List<ReportingType>? = null,
    val vesselInternalReferenceNumbers: List<String>? = null,
    val vesselIds: List<Int>? = null,
    val afterCreationDate: ZonedDateTime? = null,
    val beforeCreationDate: ZonedDateTime? = null,
    val hasPosition: Boolean? = null,
)
