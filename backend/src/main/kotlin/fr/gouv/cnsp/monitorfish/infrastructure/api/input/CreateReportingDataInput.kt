package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class CreateReportingDataInput(
    val type: ReportingType,
    val vesselInternalId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val value: InfractionSuspicionOrObservationType
) {
    fun toReporting() = Reporting(
        type = this.type,
        vesselId = this.vesselInternalId,
        vesselName = this.vesselName,
        internalReferenceNumber = this.internalReferenceNumber,
        externalReferenceNumber = this.externalReferenceNumber,
        ircs = this.ircs,
        vesselIdentifier = this.vesselIdentifier,
        creationDate = this.creationDate,
        validationDate = this.validationDate,
        isDeleted = false,
        isArchived = false,
        value = this.value
    )
}
