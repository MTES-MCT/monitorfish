package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicionOrObservationType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class CreateReportingDataInput(
    val type: ReportingType,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val flagState: CountryCode,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val value: InfractionSuspicionOrObservationType,
) {
    fun toReporting() = Reporting(
        type = this.type,
        vesselId = this.vesselId,
        vesselName = this.vesselName,
        internalReferenceNumber = this.internalReferenceNumber,
        externalReferenceNumber = this.externalReferenceNumber,
        ircs = this.ircs,
        vesselIdentifier = this.vesselIdentifier,
        flagState = this.flagState,
        creationDate = this.creationDate,
        validationDate = this.validationDate,
        isDeleted = false,
        isArchived = false,
        value = this.value,
    )
}
