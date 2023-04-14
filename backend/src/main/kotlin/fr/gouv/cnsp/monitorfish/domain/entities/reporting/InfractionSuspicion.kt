package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation

data class InfractionSuspicion(
    override val reportingActor: ReportingActor,
    override val controlUnitId: Int? = null,
    override val authorTrigram: String,
    override val authorContact: String? = null,
    override val title: String,
    override val description: String? = null,
    override val natinfCode: Int,
    val seaFront: String? = null,
    val dml: String? = null,
) : InfractionSuspicionOrObservationType(
    reportingActor = reportingActor,
    controlUnitId = controlUnitId,
    authorTrigram = authorTrigram,
    authorContact = authorContact,
    title = title,
    description = description,
    natinfCode = natinfCode,
    type = ReportingTypeMapping.INFRACTION_SUSPICION,
) {
    companion object {
        fun fromUpdatedReporting(
            updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation,
        ): InfractionSuspicion {
            require(updatedInfractionSuspicionOrObservation.natinfCode != null) {
                "NATINF code should not be null"
            }

            return InfractionSuspicion(
                reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
                controlUnitId = updatedInfractionSuspicionOrObservation.controlUnitId,
                authorTrigram = updatedInfractionSuspicionOrObservation.authorTrigram,
                authorContact = updatedInfractionSuspicionOrObservation.authorContact,
                title = updatedInfractionSuspicionOrObservation.title,
                description = updatedInfractionSuspicionOrObservation.description,
                natinfCode = updatedInfractionSuspicionOrObservation.natinfCode,
            )
        }
    }
}
