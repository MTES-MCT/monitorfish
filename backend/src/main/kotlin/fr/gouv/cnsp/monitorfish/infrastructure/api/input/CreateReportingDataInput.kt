package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.*
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
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val threatHierarchy: ThreatHierarchyDataInput? = null,
) {
    fun toReporting(createdBy: String): Reporting {
        val threat = threatHierarchy?.value
        val threatCharacterization = threatHierarchy?.children?.single()?.value
        val natinf =
            threatHierarchy
                ?.children
                ?.single()
                ?.children
                ?.single()
                ?.value

        val value =
            if (type == ReportingType.INFRACTION_SUSPICION) {
                requireNotNull(natinf) {
                    "NATINF should be not null"
                }

                InfractionSuspicion(
                    reportingActor = reportingActor,
                    controlUnitId = controlUnitId,
                    authorTrigram = "",
                    authorContact = authorContact,
                    title = title,
                    description = description,
                    natinfCode = natinf,
                    seaFront = null,
                    dml = null,
                    threat = threat,
                    threatCharacterization = threatCharacterization,
                )
            } else {
                Observation(
                    reportingActor = reportingActor,
                    controlUnitId = controlUnitId,
                    authorTrigram = "",
                    authorContact = authorContact,
                    title = title,
                    description = description,
                    seaFront = null,
                    dml = null,
                )
            }

        return Reporting(
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
            value = value,
            createdBy = createdBy,
        )
    }
}
