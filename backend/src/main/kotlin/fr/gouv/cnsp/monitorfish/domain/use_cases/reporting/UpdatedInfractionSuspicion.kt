package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor

class UpdatedInfractionSuspicion(
    val reportingActor: ReportingActor,
    val unit: String? = null,
    val authorTrigram: String? = null,
    val authorContact: String? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: String? = null,
    var seaFront: String? = null,
    var flagState: String? = null,
    val dml: String? = null)
