package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingValue
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class ReportingDataOutput(
    val id: Int? = null,
    val type: ReportingType,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val value: ReportingValue,
    val isArchived: Boolean,
    val isDeleted: Boolean,
    val infraction: InfractionDataOutput? = null,
    val underCharter: Boolean? = null
) {
    companion object {
        fun fromReporting(reporting: Reporting) = ReportingDataOutput(
            id = reporting.id,
            type = reporting.type,
            vesselName = reporting.vesselName,
            vesselId = reporting.vesselId,
            internalReferenceNumber = reporting.internalReferenceNumber,
            externalReferenceNumber = reporting.externalReferenceNumber,
            ircs = reporting.ircs,
            vesselIdentifier = reporting.vesselIdentifier,
            creationDate = reporting.creationDate,
            validationDate = reporting.validationDate,
            value = reporting.value,
            isArchived = reporting.isArchived,
            isDeleted = reporting.isDeleted,
            infraction = reporting.infraction?.let { InfractionDataOutput.fromInfraction(it) },
            underCharter = reporting.underCharter
        )
    }
}
