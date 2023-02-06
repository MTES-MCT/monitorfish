package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicionOrObservation

data class InfractionSuspicion(
    override val reportingActor: ReportingActor,
    override val unit: String? = null,
    override val authorTrigram: String,
    override val authorContact: String? = null,
    override val title: String,
    override val description: String? = null,
    override val natinfCode: String,
    override val flagState: String? = null,
    val seaFront: String? = null,
    val dml: String? = null
) : InfractionSuspicionOrObservationType(
    reportingActor = reportingActor,
    unit = unit,
    authorTrigram = authorTrigram,
    authorContact = authorContact,
    title = title,
    description = description,
    natinfCode = natinfCode,
    flagState = flagState,
    type = ReportingTypeMapping.INFRACTION_SUSPICION
) {
    companion object {
        fun fromUpdatedReporting(
            updatedInfractionSuspicionOrObservation: UpdatedInfractionSuspicionOrObservation,
            reportingValue: InfractionSuspicionOrObservationType
        ): InfractionSuspicion {
            require(!updatedInfractionSuspicionOrObservation.natinfCode.isNullOrEmpty()) {
                "NATINF code should not be null or empty"
            }

            return InfractionSuspicion(
                reportingActor = updatedInfractionSuspicionOrObservation.reportingActor,
                unit = updatedInfractionSuspicionOrObservation.unit,
                authorTrigram = updatedInfractionSuspicionOrObservation.authorTrigram,
                authorContact = updatedInfractionSuspicionOrObservation.authorContact,
                title = updatedInfractionSuspicionOrObservation.title,
                description = updatedInfractionSuspicionOrObservation.description,
                natinfCode = updatedInfractionSuspicionOrObservation.natinfCode,
                flagState = reportingValue.flagState
            )
        }
    }
}
