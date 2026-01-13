package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation

data class InfractionSuspicion(
    val natinfCode: Int,
    val threat: String,
    val threatCharacterization: String,
    val reportingActor: ReportingActor,
    val controlUnitId: Int? = null,
    val authorTrigram: String,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val seaFront: String? = null,
    val dml: String? = null,
) {
    fun checkReportingActorAndFieldsRequirements() {
        when (reportingActor) {
            ReportingActor.UNIT ->
                require(controlUnitId != null) {
                    "An unit must be set"
                }
            ReportingActor.DML ->
                require(!authorContact.isNullOrEmpty()) {
                    "An author contact must be set"
                }
            ReportingActor.DIRM ->
                require(!authorContact.isNullOrEmpty()) {
                    "An author contact must be set"
                }
            ReportingActor.OTHER ->
                require(!authorContact.isNullOrEmpty()) {
                    "An author contact must be set"
                }
            else -> {}
        }
    }

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
                natinfCode = updatedInfractionSuspicionOrObservation.natinfCode,
                threat = updatedInfractionSuspicionOrObservation.threat,
                threatCharacterization = updatedInfractionSuspicionOrObservation.threatCharacterization,
                reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
                controlUnitId = updatedInfractionSuspicionOrObservation.controlUnitId,
                authorTrigram = updatedInfractionSuspicionOrObservation.authorTrigram,
                authorContact = updatedInfractionSuspicionOrObservation.authorContact,
                title = updatedInfractionSuspicionOrObservation.title,
                description = updatedInfractionSuspicionOrObservation.description,
                seaFront = null,
                dml = null,
            )
        }
    }
}
