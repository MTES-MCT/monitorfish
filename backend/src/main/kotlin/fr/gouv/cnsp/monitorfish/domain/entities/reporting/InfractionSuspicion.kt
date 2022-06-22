package fr.gouv.cnsp.monitorfish.domain.entities.reporting

class InfractionSuspicion(
        override val reportingActor: ReportingActor,
        override val unit: String? = null,
        override val authorTrigram: String? = null,
        override val authorContact: String? = null,
        override val title: String,
        override val description: String? = null,
        override val natinfCode: String,
        val dml: String? = null
): InfractionSuspicionOrObservationType(reportingActor = reportingActor, natinfCode = natinfCode, title = title, type = ReportingTypeMapping.INFRACTION_SUSPICION)
