package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicion

class InfractionSuspicion(
    override val reportingActor: ReportingActor,
    override val unit: String? = null,
    override val authorTrigram: String? = null,
    override val authorContact: String? = null,
    override val title: String,
    override val description: String? = null,
    override val natinfCode: String,
    override var seaFront: String? = null,
    override val flagState: String? = null,
    val dml: String? = null
) : InfractionSuspicionOrObservationType(
    reportingActor = reportingActor,
    unit = unit,
    authorTrigram = authorTrigram,
    authorContact = authorContact,
    title = title,
    description = description,
    natinfCode = natinfCode,
    seaFront = seaFront,
    flagState = flagState,
    type = ReportingTypeMapping.INFRACTION_SUSPICION
) {
    companion object {
        fun fromUpdatedReporting(updatedInfractionSuspicion: UpdatedInfractionSuspicion): InfractionSuspicion {
            require(!updatedInfractionSuspicion.dml.isNullOrEmpty()) {
                "DML should not be null or empty"
            }

            require(!updatedInfractionSuspicion.natinfCode.isNullOrEmpty()) {
                "NATINF code should not be null or empty"
            }

            return InfractionSuspicion(
                reportingActor = updatedInfractionSuspicion.reportingActor,
                unit = updatedInfractionSuspicion.unit,
                authorTrigram = updatedInfractionSuspicion.authorTrigram,
                authorContact = updatedInfractionSuspicion.authorContact,
                title = updatedInfractionSuspicion.title,
                description = updatedInfractionSuspicion.description,
                natinfCode = updatedInfractionSuspicion.natinfCode,
                flagState = updatedInfractionSuspicion.flagState,
                seaFront = Reporting.getSeaFrontFromDML(updatedInfractionSuspicion.dml),
                dml = updatedInfractionSuspicion.dml)
        }
    }
}
