package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation

class UpdateReportingDataInput(
    val reportingActor: ReportingActor,
    val type: ReportingType,
    val controlUnitId: Int? = null,
    val authorTrigram: String,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: String? = null,
) {
    fun toUpdatedReportingValues() = UpdatedInfractionSuspicionOrObservation(
        reportingActor = this.reportingActor,
        type = this.type,
        controlUnitId = this.controlUnitId,
        authorTrigram = this.authorTrigram,
        authorContact = this.authorContact,
        title = this.title,
        description = this.description,
        natinfCode = this.natinfCode,
    )
}
