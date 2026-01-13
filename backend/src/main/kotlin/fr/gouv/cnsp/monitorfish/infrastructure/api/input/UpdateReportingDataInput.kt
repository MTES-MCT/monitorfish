package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation
import java.time.ZonedDateTime

class UpdateReportingDataInput(
    val reportingActor: ReportingActor,
    val type: ReportingType,
    val controlUnitId: Int? = null,
    val authorTrigram: String,
    val authorContact: String? = null,
    val expirationDate: ZonedDateTime? = null,
    val title: String,
    val description: String? = null,
    val threatHierarchy: ThreatHierarchyDataInput? = null,
) {
    fun toUpdatedReportingValues(): UpdatedInfractionSuspicionOrObservation {
        val threat = threatHierarchy?.value
        val threatCharacterization = threatHierarchy?.children?.single()?.value
        val natinf =
            threatHierarchy
                ?.children
                ?.single()
                ?.children
                ?.single()
                ?.value

        return UpdatedInfractionSuspicionOrObservation(
            reportingActor = this.reportingActor,
            type = this.type,
            controlUnitId = this.controlUnitId,
            authorTrigram = this.authorTrigram,
            authorContact = this.authorContact,
            expirationDate = this.expirationDate,
            title = this.title,
            description = this.description,
            threat = threat,
            threatCharacterization = threatCharacterization,
            natinfCode = natinf,
        )
    }
}
