package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedReporting

class Observation(
        override val reportingActor: ReportingActor,
        override val unit: String? = null,
        override val authorTrigram: String? = null,
        override val authorContact: String? = null,
        override val title: String,
        override val description: String? = null,
        override val flagState: String? = null
): InfractionSuspicionOrObservationType(
  reportingActor = reportingActor,
  natinfCode = null,
  title = title,
  type = ReportingTypeMapping.OBSERVATION,
  flagState = flagState) {
    companion object {
        fun fromUpdatedReporting(updatedReporting: UpdatedReporting): Observation = Observation(
            reportingActor = updatedReporting.reportingActor,
            unit = updatedReporting.unit,
            authorTrigram = updatedReporting.authorTrigram,
            authorContact = updatedReporting.authorContact,
            title = updatedReporting.title,
            description = updatedReporting.description)
    }
}
