package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.InfractionSuspicion
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Observation
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingContent
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
    val expirationDate: ZonedDateTime? = null,
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    @JsonSubTypes(
        JsonSubTypes.Type(value = InfractionSuspicion::class, name = "INFRACTION_SUSPICION"),
        JsonSubTypes.Type(value = Observation::class, name = "OBSERVATION"),
    )
    val value: Any,
) {
    fun toReporting() =
        Reporting(
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
            expirationDate = this.expirationDate,
            isDeleted = false,
            isArchived = false,
            value =
                when (this.value) {
                    is InfractionSuspicion -> ReportingContent.InfractionSuspicion(this.value)
                    is Observation -> ReportingContent.Observation(this.value)
                    else -> throw IllegalArgumentException("Invalid reporting value type: ${this.value::class.simpleName}")
                },
        )
}
