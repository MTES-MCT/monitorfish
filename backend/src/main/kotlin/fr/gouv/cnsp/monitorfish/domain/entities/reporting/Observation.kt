package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation

class Observation(
    override val reportingActor: ReportingActor,
    override val controlUnitId: Int? = null,
    override val authorTrigram: String,
    override val authorContact: String? = null,
    override val title: String,
    override val description: String? = null,
) : InfractionSuspicionOrObservationType(
    reportingActor = reportingActor,
    natinfCode = null,
    title = title,
    type = ReportingTypeMapping.OBSERVATION,
    authorTrigram = authorTrigram,
) {
    companion object {
        fun fromUpdatedReporting(
            updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation,
        ): Observation = Observation(
            reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
            controlUnitId = updatedInfractionSuspicionOrObservation.controlUnitId,
            authorTrigram = updatedInfractionSuspicionOrObservation.authorTrigram,
            authorContact = updatedInfractionSuspicionOrObservation.authorContact,
            title = updatedInfractionSuspicionOrObservation.title,
            description = updatedInfractionSuspicionOrObservation.description,
        )
    }
}
