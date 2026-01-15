package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingActor
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import java.time.ZonedDateTime

class UpdatedInfractionSuspicionOrObservation(
    val reportingActor: ReportingActor,
    val type: ReportingType,
    val controlUnitId: Int? = null,
    val authorContact: String? = null,
    val expirationDate: ZonedDateTime? = null,
    val title: String,
    val description: String? = null,
    val natinfCode: Int? = null,
    val threat: String? = null,
    val threatCharacterization: String? = null,
)
