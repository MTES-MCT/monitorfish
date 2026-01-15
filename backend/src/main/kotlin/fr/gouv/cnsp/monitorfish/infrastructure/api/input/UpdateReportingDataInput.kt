package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.ReportingUpdateCommand
import java.time.ZonedDateTime

class UpdateReportingDataInput(
    val reportingActor: ReportingActor,
    val type: ReportingType,
    val controlUnitId: Int? = null,
    val authorContact: String? = null,
    val expirationDate: ZonedDateTime? = null,
    val title: String,
    val description: String? = null,
    val threatHierarchy: ThreatHierarchyDataInput? = null,
) {
    fun toUpdatedReportingValues(): ReportingUpdateCommand {
        val threat = threatHierarchy?.value
        val threatCharacterization = threatHierarchy?.children?.single()?.value
        val natinf =
            threatHierarchy
                ?.children
                ?.single()
                ?.children
                ?.single()
                ?.value

        return ReportingUpdateCommand(
            reportingActor = this.reportingActor,
            type = this.type,
            controlUnitId = this.controlUnitId,
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
