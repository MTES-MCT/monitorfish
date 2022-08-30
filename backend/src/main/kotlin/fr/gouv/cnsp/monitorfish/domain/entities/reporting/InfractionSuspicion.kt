package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.use_cases.reporting.UpdatedReporting

class InfractionSuspicion(
        override val reportingActor: ReportingActor,
        override val unit: String? = null,
        override val authorTrigram: String? = null,
        override val authorContact: String? = null,
        override val title: String,
        override val description: String? = null,
        override val natinfCode: String,
        override val flagState: String? = null,
        val dml: String? = null
): InfractionSuspicionOrObservationType(
  reportingActor = reportingActor,
  natinfCode = natinfCode,
  title = title,
  type = ReportingTypeMapping.INFRACTION_SUSPICION,
  flagState = flagState) {
    companion object {
        fun fromUpdatedReporting(updatedReporting: UpdatedReporting): InfractionSuspicion {
            require(!updatedReporting.natinfCode.isNullOrEmpty()) {
                "NATINF code should not be null or empty"
            }

            return InfractionSuspicion(
                reportingActor = updatedReporting.reportingActor,
                unit = updatedReporting.unit,
                authorTrigram = updatedReporting.authorTrigram,
                authorContact = updatedReporting.authorContact,
                title = updatedReporting.title,
                description = updatedReporting.description,
                natinfCode = updatedReporting.natinfCode,
                dml = updatedReporting.dml)
        }
    }
}
