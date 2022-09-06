package fr.gouv.cnsp.monitorfish.domain.entities.reporting

class Observation(
    override val reportingActor: ReportingActor,
    override val unit: String? = null,
    override val authorTrigram: String? = null,
    override val authorContact: String? = null,
    override val title: String,
    override val description: String? = null
) : InfractionSuspicionOrObservationType(reportingActor = reportingActor, natinfCode = null, title = title, type = ReportingTypeMapping.OBSERVATION)
