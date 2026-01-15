package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation

data class Observation(
    override val reportingActor: ReportingActor,
    override val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    override val authorTrigram: String,
    override val authorContact: String? = null,
    override val title: String,
    override val description: String? = null,
    override val seaFront: String? = null,
    override val dml: String? = null,
) : InfractionSuspicionOrObservationType(
        reportingActor = reportingActor,
        natinfCode = null,
        title = title,
        type = ReportingTypeMapping.OBSERVATION,
        authorTrigram = authorTrigram,
        seaFront = seaFront,
        dml = dml,
    ) {
    companion object {
        fun fromUpdatedReporting(
            updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation,
        ): Observation =
            Observation(
                reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
                controlUnitId = updatedInfractionSuspicionOrObservation.controlUnitId,
                authorTrigram = "",
                authorContact = updatedInfractionSuspicionOrObservation.authorContact,
                title = updatedInfractionSuspicionOrObservation.title,
                description = updatedInfractionSuspicionOrObservation.description,
            )
    }
}
