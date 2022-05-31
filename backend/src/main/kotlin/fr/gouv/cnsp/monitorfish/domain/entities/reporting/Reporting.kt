package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class Reporting(
        val id: Int? = null,
        val type: ReportingType,
        val vesselName: String? = null,
        val internalReferenceNumber: String? = null,
        val externalReferenceNumber: String? = null,
        val ircs: String? = null,
        val vesselIdentifier: VesselIdentifier,
        val creationDate: ZonedDateTime,
        val validationDate: ZonedDateTime? = null,
        val value: ReportingValue,
        val isArchived: Boolean,
        val isDeleted: Boolean)
