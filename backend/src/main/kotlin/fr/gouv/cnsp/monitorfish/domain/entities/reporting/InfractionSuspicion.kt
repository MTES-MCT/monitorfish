package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation

data class InfractionSuspicion(
    override val reportingActor: ReportingActor,
    override val controlUnitId: Int? = null,
    @Deprecated("Replaced by createdBy filled in the controller")
    override val authorTrigram: String,
    override val authorContact: String? = null,
    override val title: String,
    override val description: String? = null,
    override val natinfCode: Int,
    override val seaFront: String? = null,
    override val dml: String? = null,
    override val threat: String? = null,
    override val threatCharacterization: String? = null,
) : InfractionSuspicionOrObservationType(
        reportingActor = reportingActor,
        controlUnitId = controlUnitId,
        authorTrigram = authorTrigram,
        authorContact = authorContact,
        title = title,
        description = description,
        natinfCode = natinfCode,
        seaFront = seaFront,
        dml = dml,
        threat = threat,
        threatCharacterization = threatCharacterization,
        type = ReportingTypeMapping.INFRACTION_SUSPICION,
    ) {
    companion object {
        fun fromUpdatedReporting(
            updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation,
        ): InfractionSuspicion {
            require(updatedInfractionSuspicionOrObservation.natinfCode != null) {
                "NATINF code should not be null"
            }
            require(updatedInfractionSuspicionOrObservation.threat != null) {
                "threat should not be null"
            }
            require(updatedInfractionSuspicionOrObservation.threatCharacterization != null) {
                "threatCharacterization should not be null"
            }

            return InfractionSuspicion(
                reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
                controlUnitId = updatedInfractionSuspicionOrObservation.controlUnitId,
                authorTrigram = "",
                authorContact = updatedInfractionSuspicionOrObservation.authorContact,
                title = updatedInfractionSuspicionOrObservation.title,
                description = updatedInfractionSuspicionOrObservation.description,
                natinfCode = updatedInfractionSuspicionOrObservation.natinfCode,
                threat = updatedInfractionSuspicionOrObservation.threat,
                threatCharacterization = updatedInfractionSuspicionOrObservation.threatCharacterization,
            )
        }
    }
}
