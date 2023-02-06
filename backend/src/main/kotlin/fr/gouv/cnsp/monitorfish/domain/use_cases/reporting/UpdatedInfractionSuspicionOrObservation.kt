package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType

class UpdatedInfractionSuspicionOrObservation(
    val reportingActor: ReportingActor,
    val reportingType: ReportingType,
    val unit: String? = null,
    val authorTrigram: String,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: String? = null
)
