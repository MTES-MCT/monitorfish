package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedInfractionSuspicion

class Observation(
        override val reportingActor: ReportingActor,
        override val unit: String? = null,
        override val authorTrigram: String? = null,
        override val authorContact: String? = null,
        override val title: String,
        override val description: String? = null,
        override var seaFront: String? = null,
        override val flagState: String? = null
): InfractionSuspicionOrObservationType(
  reportingActor = reportingActor,
  natinfCode = null,
  title = title,
  type = ReportingTypeMapping.OBSERVATION,
  flagState = flagState) {
    companion object {
        fun fromUpdatedReporting(updatedInfractionSuspicion: UpdatedInfractionSuspicion): Observation = Observation(
            reportingActor = updatedInfractionSuspicion.reportingActor,
            unit = updatedInfractionSuspicion.unit,
            authorTrigram = updatedInfractionSuspicion.authorTrigram,
            authorContact = updatedInfractionSuspicion.authorContact,
            title = updatedInfractionSuspicion.title,
            seaFront = updatedInfractionSuspicion.seaFront,
            description = updatedInfractionSuspicion.description)
    }
}
